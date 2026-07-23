extends Node2D

const WORLD_SIZE := Vector2(1280.0, 720.0)

func _ready() -> void:
	_configure_input_map()
	get_viewport().size_changed.connect(_on_viewport_size_changed)
	_on_viewport_size_changed()

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
	var background := $Background as ColorRect
	background.size = get_viewport_rect().size
