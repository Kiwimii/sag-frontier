extends Node

const PANEL_PATHS := [
	"HUD/StartScreen",
	"HUD/SectorMap",
	"HUD/UpgradePanel",
	"HUD/PausePanel",
	"HUD/GameOver"
]

var scene: Node
var viewport: Viewport
var touch_device := false
var rotate_layer: CanvasLayer
var rotate_blocker: ColorRect

func _ready() -> void:
	call_deferred("_bind_scene")

func _bind_scene() -> void:
	scene = get_tree().current_scene
	if scene == null:
		call_deferred("_bind_scene")
		return
	viewport = scene.get_viewport()
	touch_device = DisplayServer.is_touchscreen_available()
	viewport.size_changed.connect(_apply_layout)
	_build_rotate_overlay()
	var start_button := scene.get_node_or_null("HUD/StartScreen/Start") as Button
	if start_button != null:
		start_button.pressed.connect(_request_mobile_fullscreen)
	_apply_layout()

func _apply_layout() -> void:
	if scene == null or viewport == null:
		return
	var view_size := viewport.get_visible_rect().size
	var portrait := view_size.y > view_size.x
	for path in PANEL_PATHS:
		var panel := scene.get_node_or_null(path) as Control
		if panel != null:
			_fit_panel(panel, view_size)
	_apply_touch_targets()
	_apply_compact_hud(portrait)
	if rotate_blocker != null:
		rotate_blocker.visible = touch_device and portrait

func _fit_panel(panel: Control, view_size: Vector2) -> void:
	if panel.size.x <= 0.0 or panel.size.y <= 0.0:
		return
	panel.pivot_offset = panel.size * 0.5
	var margin := 0.94
	var scale_factor := minf(
		view_size.x * margin / panel.size.x,
		view_size.y * margin / panel.size.y
	)
	var maximum_scale := 1.65 if touch_device else 1.0
	scale_factor = clampf(scale_factor, 0.62, maximum_scale)
	panel.scale = Vector2.ONE * scale_factor

func _apply_touch_targets() -> void:
	if not touch_device:
		return
	var start_button := scene.get_node_or_null("HUD/StartScreen/Start") as Button
	if start_button != null:
		start_button.custom_minimum_size.y = 76.0
	var meta_paths := [
		"HUD/StartScreen/Meta/Hull",
		"HUD/StartScreen/Meta/Weapons",
		"HUD/StartScreen/Meta/Thrusters"
	]
	for path in meta_paths:
		var button := scene.get_node_or_null(path) as Button
		if button != null:
			button.custom_minimum_size.y = 72.0
	for path in ["HUD/GameOver/Restart", "HUD/GameOver/Command", "HUD/PausePanel/Resume"]:
		var button := scene.get_node_or_null(path) as Button
		if button != null:
			button.custom_minimum_size.y = 68.0

func _apply_compact_hud(portrait: bool) -> void:
	var subtitle := scene.get_node_or_null("HUD/Subtitle") as CanvasItem
	var high_score := scene.get_node_or_null("HUD/HighScore") as CanvasItem
	var reputation := scene.get_node_or_null("HUD/Reputation") as CanvasItem
	var mobile_hint := scene.get_node_or_null("HUD/MobileHint") as CanvasItem
	if subtitle != null:
		subtitle.visible = not portrait
	if high_score != null:
		high_score.visible = not portrait
	if reputation != null:
		reputation.visible = not portrait
	if mobile_hint != null:
		mobile_hint.visible = not portrait
	if not touch_device:
		return
	var title := scene.get_node_or_null("HUD/Title") as Label
	var sector := scene.get_node_or_null("HUD/Sector") as Label
	var score := scene.get_node_or_null("HUD/Score") as Label
	if title != null:
		title.add_theme_font_size_override("font_size", 28 if portrait else 25)
	if sector != null:
		sector.add_theme_font_size_override("font_size", 24 if portrait else 20)
	if score != null:
		score.add_theme_font_size_override("font_size", 23 if portrait else 20)

func _build_rotate_overlay() -> void:
	rotate_layer = CanvasLayer.new()
	rotate_layer.layer = 100
	scene.add_child(rotate_layer)
	rotate_blocker = ColorRect.new()
	rotate_blocker.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	rotate_blocker.color = Color(0.005, 0.012, 0.03, 0.985)
	rotate_blocker.mouse_filter = Control.MOUSE_FILTER_STOP
	rotate_layer.add_child(rotate_blocker)
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	rotate_blocker.add_child(center)
	var stack := VBoxContainer.new()
	stack.custom_minimum_size = Vector2(330.0, 250.0)
	stack.alignment = BoxContainer.ALIGNMENT_CENTER
	stack.add_theme_constant_override("separation", 24)
	center.add_child(stack)
	var icon := Label.new()
	icon.text = "↻"
	icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	icon.add_theme_font_size_override("font_size", 72)
	icon.add_theme_color_override("font_color", Color(0.35, 0.9, 1.0, 1.0))
	stack.add_child(icon)
	var headline := Label.new()
	headline.text = "HANDY QUER DREHEN"
	headline.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	headline.add_theme_font_size_override("font_size", 28)
	headline.add_theme_color_override("font_color", Color(1.0, 0.8, 0.32, 1.0))
	stack.add_child(headline)
	var copy := Label.new()
	copy.text = "S.A.G. Frontier ist für die Touch-Steuerung im Querformat optimiert. Danach startet das Spiel automatisch in der passenden Größe."
	copy.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	copy.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	copy.add_theme_font_size_override("font_size", 17)
	copy.add_theme_color_override("font_color", Color(0.75, 0.84, 0.92, 1.0))
	stack.add_child(copy)

func _request_mobile_fullscreen() -> void:
	if not touch_device:
		return
	if OS.has_feature("web"):
		JavaScriptBridge.eval("if(document.documentElement.requestFullscreen){document.documentElement.requestFullscreen().catch(function(){});}if(screen.orientation&&screen.orientation.lock){screen.orientation.lock('landscape').catch(function(){});}")
