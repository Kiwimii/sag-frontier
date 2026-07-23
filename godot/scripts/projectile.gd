extends Area2D

@export var speed := 760.0
@export var damage := 1
var direction := Vector2.RIGHT

func setup(start_position: Vector2, target_direction: Vector2) -> void:
	global_position = start_position
	direction = target_direction.normalized()
	rotation = direction.angle()

func _physics_process(delta: float) -> void:
	global_position += direction * speed * delta
	var bounds := get_viewport_rect().grow(80.0)
	if not bounds.has_point(global_position):
		queue_free()

func _on_area_entered(area: Area2D) -> void:
	if area.has_method("take_damage"):
		area.take_damage(damage)
		queue_free()
