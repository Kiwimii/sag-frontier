extends Node2D

const PROJECTILE_SCENE := preload("res://scenes/projectile.tscn")
const ENEMY_SCENE := preload("res://scenes/enemy.tscn")
const SAVE_PATH := "user://frontier_save.cfg"
const UPGRADE_CATALOG := [
	{"id": "rapid_fire", "title": "OVERCLOCKED ARRAY", "description": "Weapons fire 18% faster."},
	{"id": "heavy_laser", "title": "HEAVY LASER", "description": "+1 projectile damage."},
	{"id": "thrusters", "title": "VECTOR THRUSTERS", "description": "+45 movement speed."},
	{"id": "multishot", "title": "SPLIT LANCE", "description": "+1 simultaneous projectile."},
	{"id": "plating", "title": "REACTOR PLATING", "description": "+20 maximum hull and repair 20."},
	{"id": "accelerator", "title": "MAGNETIC ACCELERATOR", "description": "+140 projectile speed."},
	{"id": "repair", "title": "FIELD REPAIRS", "description": "Restore 35 hull immediately."}
]

@onready var player := $Player
@onready var enemies := $Enemies
@onready var projectiles := $Projectiles
@onready var health_bar := $HUD/HealthBar
@onready var score_label := $HUD/Score
@onready var time_label := $HUD/Time
@onready var level_label := $HUD/Level
@onready var xp_bar := $HUD/XPBar
@onready var xp_text := $HUD/XPText
@onready var high_score_label := $HUD/HighScore
@onready var start_panel := $HUD/StartScreen
@onready var upgrade_panel := $HUD/UpgradePanel
@onready var pause_panel := $HUD/PausePanel
@onready var game_over_panel := $HUD/GameOver

var score := 0
var high_score := 0
var elapsed := 0.0
var spawn_clock := 0.2
var shot_clock := 0.0
var game_running := false
var paused_by_player := false
var choosing_upgrade := false

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

func _ready() -> void:
	randomize()
	_configure_input_map()
	get_viewport().size_changed.connect(_on_viewport_size_changed)
	player.health_changed.connect(_on_health_changed)
	player.died.connect(_on_player_died)
	$HUD/StartScreen/Start.pressed.connect(_start_game)
	$HUD/GameOver/Restart.pressed.connect(_start_game)
	$HUD/PausePanel/Resume.pressed.connect(_resume_game)
	upgrade_buttons = [
		$HUD/UpgradePanel/Choice1 as Button,
		$HUD/UpgradePanel/Choice2 as Button,
		$HUD/UpgradePanel/Choice3 as Button
	]
	for index in range(upgrade_buttons.size()):
		upgrade_buttons[index].pressed.connect(_on_upgrade_selected.bind(index))
	_load_high_score()
	_on_viewport_size_changed()
	_show_start_screen()

func _process(delta: float) -> void:
	if not game_running or paused_by_player or choosing_upgrade:
		return
	elapsed += delta
	spawn_clock -= delta
	shot_clock -= delta
	if spawn_clock <= 0.0:
		_spawn_enemy()
		spawn_clock = maxf(0.28, 1.08 - elapsed * 0.009)
	if shot_clock <= 0.0:
		_auto_fire()
		shot_clock = fire_interval
	_update_hud()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.physical_keycode == KEY_ESCAPE or event.physical_keycode == KEY_P:
			_toggle_pause()

func _show_start_screen() -> void:
	game_running = false
	paused_by_player = false
	choosing_upgrade = false
	_clear_combat_nodes()
	player.visible = false
	player.set_physics_process(false)
	player.set_process_unhandled_input(false)
	start_panel.visible = true
	upgrade_panel.visible = false
	pause_panel.visible = false
	game_over_panel.visible = false
	$HUD/StartScreen/BestScore.text = "BEST SCORE  %06d" % high_score
	_update_hud()

func _start_game() -> void:
	_clear_combat_nodes()
	score = 0
	elapsed = 0.0
	spawn_clock = 0.2
	shot_clock = 0.0
	level = 1
	xp = 0
	xp_to_next = 30
	pending_level_ups = 0
	fire_interval = 0.42
	projectile_damage = 1
	projectile_speed = 760.0
	projectile_count = 1
	selected_upgrade_ids.clear()
	paused_by_player = false
	choosing_upgrade = false
	start_panel.visible = false
	upgrade_panel.visible = false
	pause_panel.visible = false
	game_over_panel.visible = false
	game_running = true
	player.reset_player(true)
	_set_world_paused(false)
	_update_hud()

func _spawn_enemy() -> void:
	if not game_running or paused_by_player or choosing_upgrade:
		return
	var enemy := ENEMY_SCENE.instantiate()
	var size := get_viewport_rect().size
	var side := randi() % 4
	match side:
		0: enemy.global_position = Vector2(randf_range(0.0, size.x), -45.0)
		1: enemy.global_position = Vector2(size.x + 45.0, randf_range(0.0, size.y))
		2: enemy.global_position = Vector2(randf_range(0.0, size.x), size.y + 45.0)
		_: enemy.global_position = Vector2(-45.0, randf_range(0.0, size.y))
	var difficulty := 1.0 + minf(elapsed / 180.0, 1.4)
	enemy.setup(player, difficulty, _pick_enemy_profile())
	enemy.destroyed.connect(_on_enemy_destroyed)
	enemy.reached_player.connect(_on_enemy_reached_player)
	enemies.add_child(enemy)

func _pick_enemy_profile() -> String:
	var roll := randf()
	if elapsed >= 90.0 and roll < 0.08:
		return "juggernaut"
	if elapsed >= 45.0 and roll < 0.27:
		return "tank"
	if elapsed >= 20.0 and roll < 0.55:
		return "rusher"
	if roll < 0.32:
		return "scout"
	return "drone"

func _auto_fire() -> void:
	var target := _nearest_enemy()
	if target == null:
		return
	var base_direction := player.global_position.direction_to(target.global_position)
	var spread_step := deg_to_rad(8.0)
	for index in range(projectile_count):
		var centered_index := float(index) - float(projectile_count - 1) * 0.5
		var projectile := PROJECTILE_SCENE.instantiate()
		projectile.setup(
			player.global_position,
			base_direction.rotated(centered_index * spread_step),
			projectile_damage,
			projectile_speed
		)
		projectiles.add_child(projectile)

func _nearest_enemy() -> Node2D:
	var nearest: Node2D = null
	var best := INF
	for child in enemies.get_children():
		if not is_instance_valid(child) or child.is_queued_for_deletion():
			continue
		var enemy := child as Node2D
		if enemy == null:
			continue
		var distance := player.global_position.distance_squared_to(enemy.global_position)
		if distance < best:
			best = distance
			nearest = enemy
	return nearest

func _on_enemy_destroyed(points: int, xp_amount: int) -> void:
	if not game_running:
		return
	score += points
	_gain_xp(xp_amount)
	_update_hud()

func _on_enemy_reached_player(damage: int) -> void:
	if game_running and not paused_by_player and not choosing_upgrade:
		player.take_damage(damage)

func _gain_xp(amount: int) -> void:
	xp += amount
	while xp >= xp_to_next:
		xp -= xp_to_next
		level += 1
		pending_level_ups += 1
		xp_to_next = int(round(float(xp_to_next) * 1.28 + 8.0))
	if pending_level_ups > 0 and not choosing_upgrade:
		_show_upgrade_choices()

func _show_upgrade_choices() -> void:
	choosing_upgrade = true
	upgrade_panel.visible = true
	_set_world_paused(true)
	var pool := UPGRADE_CATALOG.duplicate(true)
	pool.shuffle()
	selected_upgrade_ids.clear()
	for index in range(upgrade_buttons.size()):
		var upgrade: Dictionary = pool[index]
		selected_upgrade_ids.append(String(upgrade["id"]))
		upgrade_buttons[index].text = "%s\n\n%s" % [upgrade["title"], upgrade["description"]]
	$HUD/UpgradePanel/Header.text = "LEVEL %d // SELECT SYSTEM UPGRADE" % level

func _on_upgrade_selected(index: int) -> void:
	if not choosing_upgrade or index < 0 or index >= selected_upgrade_ids.size():
		return
	_apply_upgrade(selected_upgrade_ids[index])
	pending_level_ups = maxi(0, pending_level_ups - 1)
	upgrade_panel.visible = false
	if pending_level_ups > 0:
		call_deferred("_show_upgrade_choices")
	else:
		choosing_upgrade = false
		_set_world_paused(false)
	_update_hud()

func _apply_upgrade(upgrade_id: String) -> void:
	match upgrade_id:
		"rapid_fire":
			fire_interval = maxf(0.11, fire_interval * 0.82)
		"heavy_laser":
			projectile_damage += 1
		"thrusters":
			player.increase_speed(45.0)
		"multishot":
			projectile_count = mini(5, projectile_count + 1)
		"plating":
			player.increase_max_health(20)
		"accelerator":
			projectile_speed += 140.0
		"repair":
			player.repair(35)

func _toggle_pause() -> void:
	if not game_running or choosing_upgrade or game_over_panel.visible or start_panel.visible:
		return
	paused_by_player = not paused_by_player
	pause_panel.visible = paused_by_player
	_set_world_paused(paused_by_player)

func _resume_game() -> void:
	if paused_by_player:
		paused_by_player = false
		pause_panel.visible = false
		_set_world_paused(false)

func _set_world_paused(paused: bool) -> void:
	var active := game_running and not paused
	player.set_physics_process(active and player.health > 0)
	player.set_process_unhandled_input(active and player.health > 0)
	if paused:
		player.cancel_touch()
	for child in enemies.get_children():
		if is_instance_valid(child) and not child.is_queued_for_deletion():
			child.set_physics_process(active)
	for child in projectiles.get_children():
		if is_instance_valid(child) and not child.is_queued_for_deletion():
			child.set_physics_process(active)

func _on_health_changed(current: int, maximum: int) -> void:
	health_bar.max_value = maximum
	health_bar.value = current
	$HUD/HealthText.text = "HULL  %d / %d" % [current, maximum]

func _on_player_died() -> void:
	if not game_running:
		return
	game_running = false
	paused_by_player = false
	choosing_upgrade = false
	player.visible = false
	player.set_physics_process(false)
	player.set_process_unhandled_input(false)
	_clear_combat_nodes()
	if score > high_score:
		high_score = score
		_save_high_score()
	game_over_panel.visible = true
	upgrade_panel.visible = false
	pause_panel.visible = false
	$HUD/GameOver/FinalScore.text = "FINAL SCORE  %06d" % score
	$HUD/GameOver/BestScore.text = "BEST SCORE  %06d" % high_score
	_update_hud()

func _clear_combat_nodes() -> void:
	for child in enemies.get_children():
		child.queue_free()
	for child in projectiles.get_children():
		child.queue_free()

func _update_hud() -> void:
	score_label.text = "SCORE  %06d" % score
	high_score_label.text = "BEST  %06d" % high_score
	level_label.text = "LEVEL  %02d" % level
	xp_bar.max_value = xp_to_next
	xp_bar.value = xp
	xp_text.text = "XP  %d / %d" % [xp, xp_to_next]
	var total_seconds := int(elapsed)
	var minutes := floori(float(total_seconds) / 60.0)
	var seconds := total_seconds % 60
	time_label.text = "TIME  %02d:%02d" % [minutes, seconds]

func _load_high_score() -> void:
	var config := ConfigFile.new()
	if config.load(SAVE_PATH) == OK:
		high_score = int(config.get_value("scores", "high_score", 0))

func _save_high_score() -> void:
	var config := ConfigFile.new()
	config.set_value("scores", "high_score", high_score)
	config.save(SAVE_PATH)

func _configure_input_map() -> void:
	_register_key_action("move_left", [KEY_A, KEY_LEFT])
	_register_key_action("move_right", [KEY_D, KEY_RIGHT])
	_register_key_action("move_up", [KEY_W, KEY_UP])
	_register_key_action("move_down", [KEY_S, KEY_DOWN])

func _register_key_action(action_name: StringName, keys: Array[int]) -> void:
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name, 0.25)
	for keycode in keys:
		var event := InputEventKey.new()
		event.physical_keycode = keycode
		if not InputMap.action_has_event(action_name, event):
			InputMap.action_add_event(action_name, event)

func _on_viewport_size_changed() -> void:
	var viewport_size := get_viewport_rect().size
	$Background.size = viewport_size
	$Grid.polygon = PackedVector2Array([
		Vector2.ZERO,
		Vector2(viewport_size.x, 0.0),
		viewport_size,
		Vector2(0.0, viewport_size.y)
	])
