extends Area2D

signal destroyed(points: int)
signal reached_player(damage: int)

@export var speed := 105.0
@export var health := 2
@export var contact_damage := 12
@export var score_value := 10
var target: Node2D

func setup(target_node: Node2D, level_scale: float) -> void:
	target = target_node
	speed *= level_scale
	health = maxi(1, int(round(health * level_scale)))

func _physics_process(delta: float) -> void:
	if not is_instance_valid(target):
		return
	var direction := global_position.direction_to(target.global_position)
	global_position += direction * speed * delta
	rotation = direction.angle() + PI / 2.0
	if global_position.distance_to(target.global_position) < 30.0:
		reached_player.emit(contact_damage)
		queue_free()

func take_damage(amount: int) -> void:
	health -= amount
	modulate = Color(1.0, 0.55, 0.55, 1.0)
	var tween := create_tween()
	tween.tween_property(self, "modulate", Color.WHITE, 0.08)
	if health <= 0:
		destroyed.emit(score_value)
		queue_free()
