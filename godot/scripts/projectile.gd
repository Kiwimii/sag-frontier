extends Area2D

@export var speed := 760.0
@export var damage := 1
var direction := Vector2.RIGHT
var has_hit := false

func setup(start_position: Vector2, target_direction: Vector2, new_damage: int = 1, new_speed: float = 760.0) -> void:
	global_position = start_position
	direction = target_direction.normalized()
	damage = new_damage
	speed = new_speed
	rotation = direction.angle()

func _physics_process(delta: float) -> void:
	global_position += direction * speed * delta
	var bounds := get_viewport_rect().grow(80.0)
	if not bounds.has_point(global_position):
		queue_free()

func _on_area_entered(area: Area2D) -> void:
	if has_hit or is_queued_for_deletion():
		return
	if area.has_method("take_damage"):
		has_hit = true
		set_deferred("monitoring", false)
		area.take_damage(damage)
		queue_free()
