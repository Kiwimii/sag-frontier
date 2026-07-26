extends Node2D

const GameFlow = preload("res://scripts/services/game_flow.gd")
const SaveService = preload("res://scripts/services/save_service.gd")
const CombatDirector = preload("res://scripts/services/combat_director.gd")
const ContentCatalog = preload("res://scripts/content/frontier_catalog.gd")
const SAVE_PATH := "user://frontier_save.cfg"
const MAX_SECTORS := 5
const BASE_SECTOR_DURATION := 26.0
const MAX_META_LEVEL := 5
const UPGRADE_CATALOG: Array[Dictionary] = ContentCatalog.UPGRADE_CATALOG
const ROUTE_CATALOG: Array[Dictionary] = ContentCatalog.ROUTE_CATALOG

@onready var player = $Player
@onready var enemies: Node2D = $Enemies
@onready var projectiles: Node2D = $Projectiles
@onready var health_bar: ProgressBar = $HUD/HealthBar
@onready var score_label: Label = $HUD/Score
@onready var time_label: Label = $HUD/Time
@onready var level_label: Label = $HUD/Level
@onready var xp_bar: ProgressBar = $HUD/XPBar
@onready var xp_text: Label = $HUD/XPText
@onready var high_score_label: Label = $HUD/HighScore
@onready var sector_label: Label = $HUD/Sector
@onready var sector_timer_label: Label = $HUD/SectorTimer
@onready var reputation_label: Label = $HUD/Reputation
@onready var transmission_panel: Control = $HUD/Transmission
@onready var transmission_label: Label = $HUD/Transmission/Message
@onready var start_panel: Control = $HUD/StartScreen
@onready var route_panel: Control = $HUD/SectorMap
@onready var upgrade_panel: Control = $HUD/UpgradePanel
@onready var pause_panel: Control = $HUD/PausePanel
@onready var game_over_panel: Control = $HUD/GameOver

var score := 0
var high_score := 0
var elapsed := 0.0
var sector_elapsed := 0.0
var sector_time_left := BASE_SECTOR_DURATION
var spawn_clock := 0.2
var shot_clock := 0.0
var transmission_timer := 0.0
var flow = GameFlow.new()
var save_service = SaveService.new(SAVE_PATH)
var combat_director = CombatDirector.new()

var game_running: bool:
	get:
		return flow.is_run_active()
var paused_by_player: bool:
	get:
		return flow.is_paused()
var choosing_upgrade: bool:
	get:
		return flow.is_choosing_upgrade()
var choosing_route: bool:
	get:
		return flow.is_choosing_route()
var run_finalized: bool:
	get:
		return flow.is_finalized()

var current_sector := 1
var sectors_cleared := 0
var sector_spawn_modifier := 1.0
var route_bonus_data := 0
var selected_route_ids: Array[String] = []
var route_history: Array[String] = []
var faction_reputation: Dictionary = {"MUD": 0, "ONI": 0, "USTUR": 0}

var level := 1
var xp := 0
var xp_to_next := 30
var pending_level_ups := 0

var fire_interval := 0.42
var projectile_damage := 1
var projectile_speed := 760.0
var projectile_count := 1
var selected_upgrade_ids: Array[String] = []
var upgrade_buttons: Array[Button] = []
var route_buttons: Array[Button] = []

var frontier_data := 0
var lifetime_data := 0
var completed_runs := 0
var meta_hull_level := 0
var meta_weapons_level := 0
var meta_thrusters_level := 0

func _ready() -> void:
	randomize()
	_configure_input_map()
	get_viewport().size_changed.connect(_on_viewport_size_changed)
	player.health_changed.connect(_on_health_changed)
	player.died.connect(_on_player_died)
	($HUD/StartScreen/Start as Button).pressed.connect(_start_game)
	($HUD/StartScreen/Meta/Hull as Button).pressed.connect(_buy_meta_upgrade.bind("hull"))
	($HUD/StartScreen/Meta/Weapons as Button).pressed.connect(_buy_meta_upgrade.bind("weapons"))
	($HUD/StartScreen/Meta/Thrusters as Button).pressed.connect(_buy_meta_upgrade.bind("thrusters"))
	($HUD/GameOver/Restart as Button).pressed.connect(_start_game)
	($HUD/GameOver/Command as Button).pressed.connect(_show_start_screen)
	($HUD/PausePanel/Resume as Button).pressed.connect(_resume_game)
	upgrade_buttons = [
		$HUD/UpgradePanel/Choice1 as Button,
		$HUD/UpgradePanel/Choice2 as Button,
		$HUD/UpgradePanel/Choice3 as Button
	]
	for index: int in range(upgrade_buttons.size()):
		upgrade_buttons[index].pressed.connect(_on_upgrade_selected.bind(index))
	route_buttons = [
		$HUD/SectorMap/Route1 as Button,
		$HUD/SectorMap/Route2 as Button,
		$HUD/SectorMap/Route3 as Button
	]
	for index: int in range(route_buttons.size()):
		route_buttons[index].pressed.connect(_on_route_selected.bind(index))
	_load_progress()
	_on_viewport_size_changed()
	_show_start_screen()

func _process(delta: float) -> void:
	if transmission_timer > 0.0:
		transmission_timer = maxf(0.0, transmission_timer - delta)
		if transmission_timer <= 0.0:
			transmission_panel.visible = false
	if not game_running or paused_by_player or choosing_upgrade or choosing_route or run_finalized:
		return
	elapsed += delta
	sector_elapsed += delta
	sector_time_left = maxf(0.0, sector_time_left - delta)
	spawn_clock -= delta
	shot_clock -= delta
	if sector_time_left <= 0.0:
		_complete_sector()
		return
	if spawn_clock <= 0.0:
		_spawn_enemy()
		var base_interval: float = 1.02 - float(current_sector) * 0.065 - sector_elapsed * 0.005
		spawn_clock = maxf(0.24, base_interval / sector_spawn_modifier)
	if shot_clock <= 0.0:
		_auto_fire()
		shot_clock = fire_interval
	_update_hud()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.physical_keycode == KEY_ESCAPE or event.physical_keycode == KEY_P:
			_toggle_pause()

func _show_start_screen() -> void:
	flow.transition(GameFlow.State.COMMAND)
	_clear_combat_nodes()
	player.visible = false
	player.set_physics_process(false)
	player.set_process_unhandled_input(false)
	start_panel.visible = true
	route_panel.visible = false
	upgrade_panel.visible = false
	pause_panel.visible = false
	game_over_panel.visible = false
	transmission_panel.visible = false
	_refresh_meta_ui()
	_update_hud()

func _start_game() -> void:
	_clear_combat_nodes()
	score = 0
	elapsed = 0.0
	sector_elapsed = 0.0
	sector_time_left = BASE_SECTOR_DURATION
	spawn_clock = 0.2
	shot_clock = 0.0
	current_sector = 1
	sectors_cleared = 0
	sector_spawn_modifier = 1.0
	route_bonus_data = 0
	route_history.clear()
	faction_reputation = {"MUD": 0, "ONI": 0, "USTUR": 0}
	level = 1
	xp = 0
	xp_to_next = 30
	pending_level_ups = 0
	fire_interval = 0.42
	projectile_damage = 1
	projectile_speed = 760.0
	projectile_count = 1
	selected_upgrade_ids.clear()
	selected_route_ids.clear()
	start_panel.visible = false
	route_panel.visible = false
	upgrade_panel.visible = false
	pause_panel.visible = false
	game_over_panel.visible = false
	flow.transition(GameFlow.State.RUNNING)
	player.reset_player(true)
	_apply_meta_loadout()
	_set_world_paused(false)
	_show_transmission(
		"KIWIMI // COMMAND",
		"Pathfinder, the Frontier Relay has gone dark. Recover five beacon signatures before the Null Cartel reaches the core.",
		8.0
	)
	_update_hud()

func _apply_meta_loadout() -> void:
	if meta_hull_level > 0:
		player.increase_max_health(meta_hull_level * 8)
	if meta_thrusters_level > 0:
		player.increase_speed(float(meta_thrusters_level) * 16.0)
	if meta_weapons_level > 0:
		fire_interval = maxf(0.28, fire_interval * float(pow(0.96, meta_weapons_level)))
		projectile_damage += floori(float(meta_weapons_level) / 2.0)

func _spawn_enemy() -> void:
	if not flow.can_simulate():
		return
	combat_director.spawn_enemy(
		enemies,
		player,
		get_viewport_rect().size,
		current_sector,
		elapsed,
		sector_spawn_modifier,
		_on_enemy_destroyed,
		_on_enemy_reached_player
	)

func _auto_fire() -> void:
	combat_director.auto_fire(
		projectiles,
		enemies,
		player,
		projectile_count,
		projectile_damage,
		projectile_speed
	)

func _on_enemy_destroyed(points: int, xp_amount: int) -> void:
	if not game_running or run_finalized:
		return
	score += points
	_gain_xp(xp_amount)
	_update_hud()

func _on_enemy_reached_player(damage: int) -> void:
	if game_running and not paused_by_player and not choosing_upgrade and not choosing_route and not run_finalized:
		player.take_damage(damage)

func _gain_xp(amount: int) -> void:
	if not game_running or run_finalized:
		return
	xp += maxi(0, amount)
	while xp >= xp_to_next:
		xp -= xp_to_next
		level += 1
		pending_level_ups += 1
		xp_to_next = int(round(float(xp_to_next) * 1.28 + 8.0))
	if pending_level_ups > 0 and not choosing_upgrade:
		_show_upgrade_choices()

func _show_upgrade_choices() -> void:
	if run_finalized or not game_running:
		return
	flow.transition(GameFlow.State.UPGRADE)
	upgrade_panel.visible = true
	_set_world_paused(true)
	var pool: Array = UPGRADE_CATALOG.duplicate(true)
	pool.shuffle()
	selected_upgrade_ids.clear()
	for index: int in range(upgrade_buttons.size()):
		var upgrade: Dictionary = pool[index] as Dictionary
		selected_upgrade_ids.append(String(upgrade["id"]))
		upgrade_buttons[index].text = "%s\n\n%s" % [upgrade["title"], upgrade["description"]]
	($HUD/UpgradePanel/Header as Label).text = "LEVEL %d // SELECT SYSTEM UPGRADE" % level

func _on_upgrade_selected(index: int) -> void:
	if not choosing_upgrade or index < 0 or index >= selected_upgrade_ids.size() or run_finalized:
		return
	_apply_upgrade(selected_upgrade_ids[index])
	pending_level_ups = maxi(0, pending_level_ups - 1)
	upgrade_panel.visible = false
	if pending_level_ups > 0:
		call_deferred("_show_upgrade_choices")
	else:
		flow.transition(GameFlow.State.RUNNING)
		_set_world_paused(false)
	_update_hud()

func _apply_upgrade(upgrade_id: String) -> void:
	match upgrade_id:
		"rapid_fire": fire_interval = maxf(0.11, fire_interval * 0.82)
		"heavy_laser": projectile_damage += 1
		"thrusters": player.increase_speed(45.0)
		"multishot": projectile_count = mini(5, projectile_count + 1)
		"plating": player.increase_max_health(20)
		"accelerator": projectile_speed += 140.0
		"repair": player.repair(35)

func _complete_sector() -> void:
	if not game_running or choosing_route or run_finalized:
		return
	sectors_cleared = current_sector
	score += 100 * current_sector
	_clear_combat_nodes()
	if current_sector >= MAX_SECTORS:
		_finish_run(true)
		return
	flow.transition(GameFlow.State.ROUTE)
	route_panel.visible = true
	_set_world_paused(true)
	_prepare_route_choices()
	_update_hud()

func _prepare_route_choices() -> void:
	var choices: Array[Dictionary] = []
	for faction: String in ["MUD", "ONI", "USTUR"]:
		var faction_pool: Array[Dictionary] = []
		for route: Dictionary in ROUTE_CATALOG:
			if String(route["faction"]) == faction:
				faction_pool.append(route)
		if faction_pool.is_empty():
			push_error("No route entries exist for faction %s" % faction)
			continue
		faction_pool.shuffle()
		choices.append(faction_pool[0])
	if choices.size() != 3:
		push_error("Route generation failed to create three base choices")
		return
	if current_sector >= 2 and randf() < 0.35:
		var special_pool: Array[Dictionary] = []
		for route: Dictionary in ROUTE_CATALOG:
			var route_faction: String = String(route["faction"])
			if route_faction == "S.A.G." or route_faction == "UNKNOWN":
				special_pool.append(route)
		if not special_pool.is_empty():
			special_pool.shuffle()
			choices[randi() % choices.size()] = special_pool[0]
	choices.shuffle()
	selected_route_ids.clear()
	for index: int in range(route_buttons.size()):
		var route: Dictionary = choices[index]
		selected_route_ids.append(String(route["id"]))
		route_buttons[index].text = "%s // %s\n%s\n\n%s\n\nRISK x%.2f\n%s" % [
			route["faction"], route["kind"], route["title"], route["description"],
			float(route["risk"]), route["reward"]
		]
	($HUD/SectorMap/Header as Label).text = "SECTOR %d SECURED // CHOOSE THE NEXT ROUTE" % current_sector
	($HUD/SectorMap/Briefing as Label).text = "The relay map fractures into three viable signatures. Your route changes the next battle and who controls the story."
	($HUD/SectorMap/RouteTrack as Label).text = _route_track_text()

func _on_route_selected(index: int) -> void:
	if not choosing_route or index < 0 or index >= selected_route_ids.size() or run_finalized:
		return
	var route: Dictionary = _route_by_id(selected_route_ids[index])
	if route.is_empty():
		push_error("Selected route could not be resolved")
		return
	_apply_route(route)
	current_sector += 1
	sector_elapsed = 0.0
	sector_time_left = BASE_SECTOR_DURATION + float(current_sector - 1) * 2.0
	spawn_clock = 0.25
	shot_clock = 0.0
	flow.transition(GameFlow.State.RUNNING)
	route_panel.visible = false
	_set_world_paused(false)
	_show_transmission("%s // %s" % [route["faction"], route["title"]], String(route["result"]), 7.0)
	_update_hud()

func _route_by_id(route_id: String) -> Dictionary:
	for route: Dictionary in ROUTE_CATALOG:
		if String(route["id"]) == route_id:
			return route
	return {}

func _apply_route(route: Dictionary) -> void:
	var faction: String = String(route["faction"])
	if faction_reputation.has(faction):
		faction_reputation[faction] = int(faction_reputation[faction]) + 1
	route_history.append(String(route["title"]))
	sector_spawn_modifier = clampf(float(route["risk"]), 0.85, 1.5)
	match String(route["effect"]):
		"mud_hull":
			player.increase_max_health(18)
			player.repair(int(player.max_health))
			score += 60
		"mud_salvage":
			route_bonus_data += 2
			score += 90
		"oni_precision":
			fire_interval = maxf(0.11, fire_interval * 0.92)
			projectile_speed += 80.0
		"oni_flux":
			player.repair(30)
			projectile_count = mini(5, projectile_count + 1)
		"ustur_weapons":
			projectile_damage += 1
			score += 75
		"ustur_overclock":
			fire_interval = maxf(0.11, fire_interval * 0.88)
			score += 125
		"frontier_cache":
			player.repair(25)
			score += 150
		"null_signal":
			projectile_damage += 1
			route_bonus_data += 3

func _route_track_text() -> String:
	var track := "ORIGIN  "
	for sector_index: int in range(1, MAX_SECTORS + 1):
		track += "●" if sector_index <= current_sector else "○"
		if sector_index < MAX_SECTORS:
			track += "━━"
	return track + "  FRONTIER CORE"

func _show_transmission(source: String, message: String, duration: float) -> void:
	transmission_panel.visible = true
	transmission_label.text = "%s\n%s" % [source, message]
	transmission_timer = maxf(0.0, duration)

func _toggle_pause() -> void:
	if not flow.can_toggle_pause() or game_over_panel.visible or start_panel.visible:
		return
	flow.transition(
		GameFlow.State.RUNNING if paused_by_player else GameFlow.State.PAUSED
	)
	pause_panel.visible = paused_by_player
	_set_world_paused(paused_by_player)

func _resume_game() -> void:
	if paused_by_player and game_running and not run_finalized:
		flow.transition(GameFlow.State.RUNNING)
		pause_panel.visible = false
		_set_world_paused(false)

func _set_world_paused(paused: bool) -> void:
	var active: bool = game_running and not paused and not run_finalized
	player.set_physics_process(active and int(player.health) > 0)
	player.set_process_unhandled_input(active and int(player.health) > 0)
	if paused:
		player.cancel_touch()
	for child: Node in enemies.get_children():
		if is_instance_valid(child) and not child.is_queued_for_deletion():
			child.set_physics_process(active)
	for child: Node in projectiles.get_children():
		if is_instance_valid(child) and not child.is_queued_for_deletion():
			child.set_physics_process(active)

func _on_health_changed(current: int, maximum: int) -> void:
	health_bar.max_value = maximum
	health_bar.value = current
	($HUD/HealthText as Label).text = "HULL  %d / %d" % [current, maximum]

func _on_player_died() -> void:
	if game_running and not run_finalized:
		_finish_run(false)

func _finish_run(success: bool) -> void:
	if run_finalized:
		return
	flow.transition(GameFlow.State.RESULT)
	player.visible = false
	player.set_physics_process(false)
	player.set_process_unhandled_input(false)
	_clear_combat_nodes()
	if score > high_score:
		high_score = score
	var cleared: int = MAX_SECTORS if success else sectors_cleared
	var earned_data: int = maxi(1, int(floor(float(score) / 300.0)) + cleared * 2 + route_bonus_data)
	if success:
		earned_data += 5
	frontier_data += earned_data
	lifetime_data += earned_data
	completed_runs += 1
	_save_progress()
	game_over_panel.visible = true
	route_panel.visible = false
	upgrade_panel.visible = false
	pause_panel.visible = false
	transmission_panel.visible = false
	($HUD/GameOver/Headline as Label).text = "FRONTIER CORE SECURED" if success else "SIGNAL LOST"
	($HUD/GameOver/FinalScore as Label).text = "FINAL SCORE  %06d" % score
	($HUD/GameOver/BestScore as Label).text = "BEST SCORE  %06d" % high_score
	($HUD/GameOver/RunSummary as Label).text = "SECTORS %d / %d    FRONTIER DATA +%d\nACCOUNT DATA %d    COMMAND RANK %d" % [
		cleared, MAX_SECTORS, earned_data, frontier_data, _command_rank()
	]
	($HUD/GameOver/Epilogue as Label).text = _epilogue_text(success)
	_update_hud()

func _epilogue_text(success: bool) -> String:
	if not success:
		return "The relay keeps your final telemetry. No expedition is wasted; Command will rebuild from what you recovered."
	match _dominant_faction():
		"MUD": return "MUD convoys answer the restored beacon first. The Frontier becomes a road instead of a graveyard."
		"ONI": return "ONI signal choirs fold through the restored relay. The Frontier begins to sing again."
		"USTUR": return "Ustur foundries synchronize with the core. The Frontier wakes as a machine with a purpose."
		_: return "S.A.G. keeps the relay independent. Three factions now know the Frontier has a new guardian."

func _dominant_faction() -> String:
	var best_faction := "S.A.G."
	var best_value := 0
	var tied := false
	for faction: String in ["MUD", "ONI", "USTUR"]:
		var value: int = int(faction_reputation[faction])
		if value > best_value:
			best_value = value
			best_faction = faction
			tied = false
		elif value == best_value and value > 0:
			tied = true
	return "S.A.G." if tied else best_faction

func _meta_upgrade_cost(level_value: int) -> int:
	return 5 + level_value * 7

func _buy_meta_upgrade(upgrade_id: String) -> void:
	var current_level := 0
	match upgrade_id:
		"hull": current_level = meta_hull_level
		"weapons": current_level = meta_weapons_level
		"thrusters": current_level = meta_thrusters_level
		_: return
	if current_level >= MAX_META_LEVEL:
		return
	var cost: int = _meta_upgrade_cost(current_level)
	if frontier_data < cost:
		_show_start_feedback("Insufficient Frontier Data. Complete another expedition.")
		return
	frontier_data -= cost
	match upgrade_id:
		"hull": meta_hull_level += 1
		"weapons": meta_weapons_level += 1
		"thrusters": meta_thrusters_level += 1
	_save_progress()
	_refresh_meta_ui()
	_show_start_feedback("Permanent system installed. Future expeditions launch stronger.")

func _show_start_feedback(message: String) -> void:
	($HUD/StartScreen/MetaFeedback as Label).text = message

func _refresh_meta_ui() -> void:
	($HUD/StartScreen/BestScore as Label).text = "BEST SCORE  %06d" % high_score
	($HUD/StartScreen/Account as Label).text = "COMMAND RANK %02d    FRONTIER DATA %d    RUNS %d" % [
		_command_rank(), frontier_data, completed_runs
	]
	($HUD/StartScreen/MetaFeedback as Label).text = "Spend recovered data on permanent expedition systems."
	_refresh_meta_button($HUD/StartScreen/Meta/Hull as Button, "REINFORCED HULL", meta_hull_level, "+8 starting hull per level")
	_refresh_meta_button($HUD/StartScreen/Meta/Weapons as Button, "CALIBRATED WEAPONS", meta_weapons_level, "fire rate + damage scaling")
	_refresh_meta_button($HUD/StartScreen/Meta/Thrusters as Button, "VECTOR CONTROL", meta_thrusters_level, "+16 starting speed per level")

func _refresh_meta_button(button: Button, title: String, level_value: int, benefit: String) -> void:
	if level_value >= MAX_META_LEVEL:
		button.text = "%s  %d/%d\nMAXED // %s" % [title, level_value, MAX_META_LEVEL, benefit]
		button.disabled = true
		return
	var cost: int = _meta_upgrade_cost(level_value)
	button.text = "%s  %d/%d\nCOST %d DATA // %s" % [title, level_value, MAX_META_LEVEL, cost, benefit]
	button.disabled = frontier_data < cost

func _command_rank() -> int:
	return 1 + int(floor(float(lifetime_data) / 25.0))

func _update_hud() -> void:
	score_label.text = "SCORE  %06d" % score
	high_score_label.text = "BEST  %06d" % high_score
	level_label.text = "LEVEL  %02d" % level
	xp_bar.max_value = xp_to_next
	xp_bar.value = xp
	xp_text.text = "XP  %d / %d" % [xp, xp_to_next]
	var total_seconds: int = int(elapsed)
	var minutes: int = floori(float(total_seconds) / 60.0)
	var seconds: int = total_seconds % 60
	time_label.text = "RUN  %02d:%02d" % [minutes, seconds]
	sector_label.text = "SECTOR  %d / %d" % [current_sector, MAX_SECTORS]
	sector_timer_label.text = "JUMP WINDOW  %02d" % ceili(sector_time_left)
	reputation_label.text = "MUD %d   ONI %d   USTUR %d" % [
		int(faction_reputation["MUD"]), int(faction_reputation["ONI"]), int(faction_reputation["USTUR"])
	]

func _load_progress() -> void:
	var progress: Dictionary = save_service.load_progress(MAX_META_LEVEL)
	high_score = int(progress.high_score)
	frontier_data = int(progress.frontier_data)
	lifetime_data = int(progress.lifetime_data)
	completed_runs = int(progress.completed_runs)
	meta_hull_level = int(progress.hull_level)
	meta_weapons_level = int(progress.weapons_level)
	meta_thrusters_level = int(progress.thrusters_level)

func _save_progress() -> void:
	var save_result: Error = save_service.save_progress({
		"high_score": high_score,
		"frontier_data": frontier_data,
		"lifetime_data": lifetime_data,
		"completed_runs": completed_runs,
		"hull_level": meta_hull_level,
		"weapons_level": meta_weapons_level,
		"thrusters_level": meta_thrusters_level,
	})
	if save_result != OK:
		push_error("Could not save Frontier progress: %s" % error_string(save_result))

func _configure_input_map() -> void:
	_register_key_action("move_left", [KEY_A, KEY_LEFT])
	_register_key_action("move_right", [KEY_D, KEY_RIGHT])
	_register_key_action("move_up", [KEY_W, KEY_UP])
	_register_key_action("move_down", [KEY_S, KEY_DOWN])

func _register_key_action(action_name: StringName, keys: Array[int]) -> void:
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name, 0.25)
	for keycode: int in keys:
		var event := InputEventKey.new()
		event.physical_keycode = keycode
		if not InputMap.action_has_event(action_name, event):
			InputMap.action_add_event(action_name, event)

func _clear_combat_nodes() -> void:
	combat_director.clear(enemies, projectiles)

func _on_viewport_size_changed() -> void:
	var viewport_size: Vector2 = get_viewport_rect().size
	$Background.size = viewport_size
	$Grid.polygon = PackedVector2Array([
		Vector2.ZERO,
		Vector2(viewport_size.x, 0.0),
		viewport_size,
		Vector2(0.0, viewport_size.y)
	])

# Deterministic test hooks used by the headless release-flow test.
func debug_force_sector_complete() -> void:
	_complete_sector()

func debug_select_route(index: int = 0) -> void:
	_on_route_selected(index)

func debug_force_failure() -> void:
	_finish_run(false)
