extends CharacterBody2D

signal health_changed(current: int, maximum: int)
signal died

@export var speed := 360.0
@export var acceleration := 1800.0
@export var deceleration := 2200.0
@export var max_health := 100

var health := 100
var touch_origin := Vector2.ZERO
var touch_vector := Vector2.ZERO
var active_touch := -1

func _ready() -> void:
	health = max_health
	health_changed.emit(health, max_health)

func _physics_process(delta: float) -> void:
	var keyboard := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	var direction := touch_vector if touch_vector.length() > 0.05 else keyboard
	var target_velocity := direction.normalized() * speed
	var rate := acceleration if direction.length() > 0.05 else deceleration
	velocity = velocity.move_toward(target_velocity, rate * delta)
	move_and_slide()
	_clamp_to_viewport()
	if velocity.length_squared() > 4.0:
		rotation = velocity.angle() + PI / 2.0

func take_damage(amount: int) -> void:
	if health <= 0 or not is_physics_processing():
		return
	health = maxi(0, health - amount)
	health_changed.emit(health, max_health)
	modulate = Color(1.0, 0.35, 0.35, 1.0)
	create_tween().tween_property(self, "modulate", Color.WHITE, 0.18)
	if health <= 0:
		died.emit()

func reset_player() -> void:
	health = max_health
	global_position = get_viewport_rect().size * 0.5
	velocity = Vector2.ZERO
	rotation = 0.0
	modulate = Color.WHITE
	touch_origin = Vector2.ZERO
	touch_vector = Vector2.ZERO
	active_touch = -1
	visible = true
	set_physics_process(true)
	set_process_unhandled_input(true)
	health_changed.emit(health, max_health)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		_handle_touch(event)
	elif event is InputEventScreenDrag and event.index == active_touch:
		_update_touch_vector(event.position)

func _handle_touch(event: InputEventScreenTouch) -> void:
	var half_width := get_viewport_rect().size.x * 0.7
	if event.pressed and active_touch == -1 and event.position.x <= half_width:
		active_touch = event.index
		touch_origin = event.position
		touch_vector = Vector2.ZERO
	elif not event.pressed and event.index == active_touch:
		active_touch = -1
		touch_origin = Vector2.ZERO
		touch_vector = Vector2.ZERO

func _update_touch_vector(position: Vector2) -> void:
	var displacement := position - touch_origin
	touch_vector = displacement.limit_length(110.0) / 110.0

func _clamp_to_viewport() -> void:
	var bounds := get_viewport_rect().size
	global_position.x = clampf(global_position.x, 24.0, bounds.x - 24.0)
	global_position.y = clampf(global_position.y, 24.0, bounds.y - 24.0)
