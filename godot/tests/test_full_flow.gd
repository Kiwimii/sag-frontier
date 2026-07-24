extends SceneTree

var failures := 0

func _initialize() -> void:
	call_deferred("_run")

func _check(condition: bool, message: String) -> void:
	if condition:
		print("[FLOW PASS] %s" % message)
		return
	failures += 1
	push_error("[FLOW FAIL] %s" % message)

func _run() -> void:
	var save_file := ProjectSettings.globalize_path("user://frontier_save.cfg")
	if FileAccess.file_exists(save_file):
		DirAccess.remove_absolute(save_file)

	var packed_scene: PackedScene = load("res://scenes/main.tscn")
	_check(packed_scene != null, "main scene loads")
	if packed_scene == null:
		quit(1)
		return

	var game = packed_scene.instantiate()
	root.add_child(game)
	current_scene = game
	await process_frame
	await process_frame

	_check(game.get("start_panel").visible, "command screen is visible after boot")
	_check(not bool(game.get("game_running")), "game is idle before launch")
	_check(not game.get_node("Player").visible, "player is hidden on command screen")
	for action_name: StringName in [&"move_left", &"move_right", &"move_up", &"move_down"]:
		_check(InputMap.has_action(action_name), "input action %s is registered" % action_name)

	game.call("_start_game")
	await process_frame
	_check(bool(game.get("game_running")), "launch starts a run")
	_check(not game.get("start_panel").visible, "command screen closes on launch")
	_check(game.get_node("Player").visible, "player becomes visible")
	_check(game.get_node("Player").is_physics_processing(), "player movement processing is enabled")
	_check(int(game.get("current_sector")) == 1, "run begins in sector one")
	_check(float(game.get("sector_time_left")) > 0.0, "sector timer is initialized")

	var start_x: float = game.get_node("Player").global_position.x
	Input.action_press("move_right")
	await physics_frame
	await physics_frame
	Input.action_release("move_right")
	_check(game.get_node("Player").global_position.x > start_x, "keyboard movement changes player position")

	game.call("_toggle_pause")
	await process_frame
	_check(bool(game.get("paused_by_player")), "pause state activates")
	_check(game.get("pause_panel").visible, "pause panel is visible")
	game.call("_resume_game")
	await process_frame
	_check(not bool(game.get("paused_by_player")), "resume clears pause state")

	game.call("_gain_xp", 30)
	await process_frame
	_check(bool(game.get("choosing_upgrade")), "level threshold opens upgrade selection")
	_check(game.get("upgrade_panel").visible, "upgrade panel is visible")
	_check((game.get("selected_upgrade_ids") as Array).size() == 3, "three upgrades are offered")
	game.call("_on_upgrade_selected", 0)
	await process_frame
	_check(not bool(game.get("choosing_upgrade")), "upgrade selection resumes the run")
	_check(int(game.get("level")) == 2, "level increases after gaining XP")

	for completed_sector: int in range(1, 5):
		game.call("debug_force_sector_complete")
		await process_frame
		_check(bool(game.get("choosing_route")), "sector %d opens route selection" % completed_sector)
		_check(game.get("route_panel").visible, "route panel is visible after sector %d" % completed_sector)
		_check((game.get("selected_route_ids") as Array).size() == 3, "sector %d offers three routes" % completed_sector)
		game.call("debug_select_route", 0)
		await process_frame
		_check(not bool(game.get("choosing_route")), "route choice closes after sector %d" % completed_sector)
		_check(int(game.get("current_sector")) == completed_sector + 1, "route advances to sector %d" % (completed_sector + 1))
		_check(bool(game.get("game_running")), "run continues after route choice")

	game.call("debug_force_sector_complete")
	await process_frame
	_check(bool(game.get("run_finalized")), "fifth sector finalizes the run")
	_check(not bool(game.get("game_running")), "successful run stops combat")
	_check(game.get("game_over_panel").visible, "result panel is visible after success")
	_check((game.get_node("HUD/GameOver/Headline") as Label).text == "FRONTIER CORE SECURED", "success headline is correct")
	_check(int(game.get("completed_runs")) == 1, "successful run increments completed runs")
	_check(int(game.get("frontier_data")) > 0, "successful run awards Frontier Data")

	var data_after_success: int = int(game.get("frontier_data"))
	var runs_after_success: int = int(game.get("completed_runs"))
	game.call("_finish_run", true)
	await process_frame
	_check(int(game.get("frontier_data")) == data_after_success, "duplicate finish cannot award data twice")
	_check(int(game.get("completed_runs")) == runs_after_success, "duplicate finish cannot count a second run")

	game.call("_show_start_screen")
	await process_frame
	game.set("frontier_data", 100)
	game.call("_buy_meta_upgrade", "hull")
	await process_frame
	_check(int(game.get("meta_hull_level")) == 1, "permanent hull upgrade can be purchased")
	_check(int(game.get("frontier_data")) == 95, "meta upgrade deducts its cost")
	_check(FileAccess.file_exists(save_file), "progress save file is written")

	game.call("_start_game")
	await process_frame
	_check(int(game.get_node("Player").max_health) == 108, "permanent hull upgrade applies to the next run")

	game.set("score", 450)
	game.set("sectors_cleared", 2)
	var data_before_failure: int = int(game.get("frontier_data"))
	var runs_before_failure: int = int(game.get("completed_runs"))
	game.call("debug_force_failure")
	await process_frame
	_check(int(game.get("frontier_data")) > data_before_failure, "failed run still awards Frontier Data")
	_check(int(game.get("completed_runs")) == runs_before_failure + 1, "failed run is counted exactly once")
	_check((game.get_node("HUD/GameOver/Headline") as Label).text == "SIGNAL LOST", "failure headline is correct")

	var config := ConfigFile.new()
	_check(config.load("user://frontier_save.cfg") == OK, "saved progress can be reloaded")
	_check(int(config.get_value("meta", "hull_level", 0)) == 1, "permanent upgrade persists in save data")
	_check(int(config.get_value("meta", "completed_runs", 0)) == int(game.get("completed_runs")), "run count persists in save data")

	game.call("_show_start_screen")
	game.call("_start_game")
	await process_frame
	for index: int in range(150):
		game.call("_spawn_enemy")
	_check(game.get_node("Enemies").get_child_count() <= 90, "enemy count is capped for mobile performance")
	for index: int in range(150):
		game.call("_auto_fire")
	_check(game.get_node("Projectiles").get_child_count() <= 100, "projectile count is capped for mobile performance")

	game.queue_free()
	await process_frame
	if failures == 0:
		print("FULL_FLOW_TEST_OK")
	else:
		push_error("FULL_FLOW_TEST_FAILED: %d checks failed" % failures)
	quit(failures)
