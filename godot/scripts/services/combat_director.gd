class_name FrontierCombatDirector
extends RefCounted

const PROJECTILE_SCENE: PackedScene = preload("res://scenes/projectile.tscn")
const ENEMY_SCENE: PackedScene = preload("res://scenes/enemy.tscn")
const MAX_ACTIVE_ENEMIES := 90
const MAX_ACTIVE_PROJECTILES := 100

func spawn_enemy(
	enemies: Node2D,
	player: Node2D,
	viewport_size: Vector2,
	current_sector: int,
	elapsed: float,
	spawn_modifier: float,
	on_destroyed: Callable,
	on_reached_player: Callable
) -> void:
	if enemies.get_child_count() >= MAX_ACTIVE_ENEMIES:
		return
	var enemy = ENEMY_SCENE.instantiate()
	if enemy == null:
		push_error("Enemy scene could not be instantiated")
		return
	var side: int = randi() % 4
	match side:
		0: enemy.global_position = Vector2(randf_range(0.0, viewport_size.x), -45.0)
		1: enemy.global_position = Vector2(viewport_size.x + 45.0, randf_range(0.0, viewport_size.y))
		2: enemy.global_position = Vector2(randf_range(0.0, viewport_size.x), viewport_size.y + 45.0)
		_: enemy.global_position = Vector2(-45.0, randf_range(0.0, viewport_size.y))
	var difficulty: float = 1.0 + float(current_sector - 1) * 0.18 + minf(elapsed / 240.0, 0.7)
	difficulty *= spawn_modifier
	enemy.setup(player, difficulty, pick_enemy_profile(current_sector))
	enemy.destroyed.connect(on_destroyed)
	enemy.reached_player.connect(on_reached_player)
	enemies.add_child(enemy)

func pick_enemy_profile(current_sector: int) -> String:
	var roll: float = randf()
	if current_sector >= 5 and roll < 0.14:
		return "juggernaut"
	if current_sector >= 3 and roll < 0.28:
		return "tank"
	if current_sector >= 2 and roll < 0.58:
		return "rusher"
	if roll < 0.34:
		return "scout"
	return "drone"

func auto_fire(
	projectiles: Node2D,
	enemies: Node2D,
	player: Node2D,
	projectile_count: int,
	projectile_damage: int,
	projectile_speed: float
) -> void:
	if projectiles.get_child_count() >= MAX_ACTIVE_PROJECTILES:
		return
	var target: Node2D = nearest_enemy(enemies, player.global_position)
	if target == null:
		return
	var player_position: Vector2 = player.global_position
	var base_direction: Vector2 = player_position.direction_to(target.global_position)
	var spread_step: float = deg_to_rad(8.0)
	var available_slots: int = maxi(0, MAX_ACTIVE_PROJECTILES - projectiles.get_child_count())
	var shots_to_fire: int = mini(projectile_count, available_slots)
	for index: int in range(shots_to_fire):
		var centered_index: float = float(index) - float(shots_to_fire - 1) * 0.5
		var projectile = PROJECTILE_SCENE.instantiate()
		if projectile == null:
			continue
		projectile.setup(
			player_position,
			base_direction.rotated(centered_index * spread_step),
			projectile_damage,
			projectile_speed
		)
		projectiles.add_child(projectile)

func nearest_enemy(enemies: Node2D, player_position: Vector2) -> Node2D:
	var nearest: Node2D = null
	var best_distance_sq: float = INF
	for child: Node in enemies.get_children():
		if not is_instance_valid(child) or child.is_queued_for_deletion():
			continue
		var enemy_node: Node2D = child as Node2D
		if enemy_node == null:
			continue
		var distance_sq: float = player_position.distance_squared_to(enemy_node.global_position)
		if distance_sq < best_distance_sq:
			best_distance_sq = distance_sq
			nearest = enemy_node
	return nearest

func clear(enemies: Node2D, projectiles: Node2D) -> void:
	for child: Node in enemies.get_children():
		child.queue_free()
	for child: Node in projectiles.get_children():
		child.queue_free()
