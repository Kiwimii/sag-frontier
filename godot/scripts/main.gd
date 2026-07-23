extends Node2D

const PROJECTILE_SCENE := preload("res://scenes/projectile.tscn")
const ENEMY_SCENE := preload("res://scenes/enemy.tscn")

@onready var player := $Player
@onready var enemies := $Enemies
@onready var projectiles := $Projectiles
@onready var health_bar := $HUD/HealthBar
@onready var score_label := $HUD/Score
@onready var time_label := $HUD/Time
@onready var game_over_panel := $HUD/GameOver

var score := 0
var elapsed := 0.0
var spawn_clock := 0.0
var shot_clock := 0.0
var game_running := true

func _ready() -> void:
	_configure_input_map()
	get_viewport().size_changed.connect(_on_viewport_size_changed)
	player.health_changed.connect(_on_health_changed)
	player.died.connect(_on_player_died)
	$HUD/GameOver/Restart.pressed.connect(_restart_game)
	_on_viewport_size_changed()
	_on_health_changed(player.health, player.max_health)

func _process(delta: float) -> void:
	if not game_running:
		return
	elapsed += delta
	spawn_clock -= delta
	shot_clock -= delta
	if spawn_clock <= 0.0:
		_spawn_enemy()
		spawn_clock = maxf(0.38, 1.15 - elapsed * 0.012)
	if shot_clock <= 0.0:
		_auto_fire()
		shot_clock = maxf(0.18, 0.44 - elapsed * 0.002)
	time_label.text = "TIME  %02d:%02d" % [int(elapsed) / 60, int(elapsed) % 60]

func _spawn_enemy() -> void:
	var enemy := ENEMY_SCENE.instantiate()
	var size := get_viewport_rect().size
	var side := randi() % 4
	match side:
		0: enemy.global_position = Vector2(randf_range(0.0, size.x), -35.0)
		1: enemy.global_position = Vector2(size.x + 35.0, randf_range(0.0, size.y))
		2: enemy.global_position = Vector2(randf_range(0.0, size.x), size.y + 35.0)
		_: enemy.global_position = Vector2(-35.0, randf_range(0.0, size.y))
	enemy.setup(player, 1.0 + minf(elapsed / 140.0, 1.1))
	enemy.destroyed.connect(_on_enemy_destroyed)
	enemy.reached_player.connect(player.take_damage)
	enemies.add_child(enemy)

func _auto_fire() -> void:
	var target := _nearest_enemy()
	if target == null:
		return
	var projectile := PROJECTILE_SCENE.instantiate()
	projectile.setup(player.global_position, player.global_position.direction_to(target.global_position))
	projectiles.add_child(projectile)

func _nearest_enemy() -> Node2D:
	var nearest: Node2D
	var best := INF
	for enemy in enemies.get_children():
		var distance := player.global_position.distance_squared_to(enemy.global_position)
		if distance < best:
			best = distance
			nearest = enemy
	return nearest

func _on_enemy_destroyed(points: int) -> void:
	score += points
	score_label.text = "SCORE  %06d" % score

func _on_health_changed(current: int, maximum: int) -> void:
	health_bar.max_value = maximum
	health_bar.value = current
	$HUD/HealthText.text = "HULL  %d / %d" % [current, maximum]

func _on_player_died() -> void:
	game_running = false
	player.visible = false
	player.set_physics_process(false)
	game_over_panel.visible = true
	$HUD/GameOver/FinalScore.text = "FINAL SCORE  %06d" % score

func _restart_game() -> void:
	for child in enemies.get_children(): child.queue_free()
	for child in projectiles.get_children(): child.queue_free()
	score = 0
	elapsed = 0.0
	spawn_clock = 0.2
	shot_clock = 0.0
	score_label.text = "SCORE  000000"
	game_over_panel.visible = false
	game_running = true
	player.reset_player()

func _configure_input_map() -> void:
	_register_key_action("move_left", [KEY_A, KEY_LEFT])
	_register_key_action("move_right", [KEY_D, KEY_RIGHT])
	_register_key_action("move_up", [KEY_W, KEY_UP])
	_register_key_action("move_down", [KEY_S, KEY_DOWN])

func _register_key_action(action_name: StringName, keys: Array[int]) -> void:
	if not InputMap.has_action(action_name): InputMap.add_action(action_name, 0.25)
	for keycode in keys:
		var event := InputEventKey.new()
		event.physical_keycode = keycode
		if not InputMap.action_has_event(action_name, event): InputMap.action_add_event(action_name, event)

func _on_viewport_size_changed() -> void:
	$Background.size = get_viewport_rect().size
