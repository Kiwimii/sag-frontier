extends Area2D

signal destroyed(points: int, xp_amount: int)
signal reached_player(damage: int)

@export var speed := 105.0
@export var health := 2
@export var contact_damage := 12
@export var score_value := 10

var xp_value := 6
var target: Node2D
var age := 0.0
var lateral_strength := 0.0
var lateral_frequency := 3.0
var has_resolved := false

func setup(target_node: Node2D, difficulty_scale: float, profile: String = "drone") -> void:
	target = target_node
	_apply_profile(profile)
	speed *= minf(difficulty_scale, 2.4)
	health = maxi(1, int(round(float(health) * (0.72 + difficulty_scale * 0.28))))
	contact_damage = maxi(1, int(round(float(contact_damage) * (0.88 + difficulty_scale * 0.12))))

func _apply_profile(profile: String) -> void:
	match profile:
		"scout":
			speed = 150.0
			health = 1
			contact_damage = 9
			score_value = 14
			xp_value = 8
			lateral_strength = 0.42
			lateral_frequency = 5.2
			scale = Vector2(0.78, 0.78)
			$Body.color = Color(0.35, 0.95, 1.0, 1.0)
			$Core.color = Color(0.95, 1.0, 1.0, 1.0)
		"rusher":
			speed = 205.0
			health = 1
			contact_damage = 16
			score_value = 18
			xp_value = 10
			scale = Vector2(0.88, 0.88)
			$Body.color = Color(1.0, 0.48, 0.12, 1.0)
			$Core.color = Color(1.0, 0.92, 0.45, 1.0)
		"tank":
			speed = 62.0
			health = 7
			contact_damage = 24
			score_value = 38
			xp_value = 22
			scale = Vector2(1.35, 1.35)
			$Body.color = Color(0.72, 0.22, 1.0, 1.0)
			$Core.color = Color(1.0, 0.55, 1.0, 1.0)
		"juggernaut":
			speed = 48.0
			health = 14
			contact_damage = 34
			score_value = 80
			xp_value = 45
			scale = Vector2(1.7, 1.7)
			$Body.color = Color(0.95, 0.18, 0.28, 1.0)
			$Core.color = Color(1.0, 0.85, 0.2, 1.0)
		_:
			speed = 105.0
			health = 2
			contact_damage = 12
			score_value = 10
			xp_value = 6
			$Body.color = Color(1.0, 0.27, 0.44, 1.0)
			$Core.color = Color(1.0, 0.75, 0.25, 1.0)

func _physics_process(delta: float) -> void:
	if has_resolved or not is_instance_valid(target):
		return
	age += delta
	var direction := global_position.direction_to(target.global_position)
	if lateral_strength > 0.0:
		var lateral := direction.orthogonal() * sin(age * lateral_frequency) * lateral_strength
		direction = (direction + lateral).normalized()
	global_position += direction * speed * delta
	rotation = direction.angle() + PI / 2.0
	if global_position.distance_to(target.global_position) < 30.0 * maxf(scale.x, 1.0):
		has_resolved = true
		reached_player.emit(contact_damage)
		queue_free()

func take_damage(amount: int) -> void:
	if has_resolved:
		return
	health -= amount
	modulate = Color(1.0, 0.55, 0.55, 1.0)
	var tween := create_tween()
	tween.tween_property(self, "modulate", Color.WHITE, 0.08)
	if health <= 0:
		has_resolved = true
		destroyed.emit(score_value, xp_value)
		queue_free()
