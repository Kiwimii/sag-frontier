class_name FrontierSaveService
extends RefCounted

const SCHEMA_VERSION := 2

var save_path: String

func _init(path: String) -> void:
	save_path = path

func load_progress(max_meta_level: int) -> Dictionary:
	var progress := {
		"high_score": 0,
		"frontier_data": 0,
		"lifetime_data": 0,
		"completed_runs": 0,
		"hull_level": 0,
		"weapons_level": 0,
		"thrusters_level": 0,
	}
	var config := ConfigFile.new()
	if config.load(save_path) != OK:
		return progress
	progress.high_score = maxi(0, int(config.get_value("scores", "high_score", 0)))
	progress.frontier_data = maxi(0, int(config.get_value("meta", "frontier_data", 0)))
	progress.lifetime_data = maxi(0, int(config.get_value("meta", "lifetime_data", 0)))
	progress.completed_runs = maxi(0, int(config.get_value("meta", "completed_runs", 0)))
	progress.hull_level = clampi(
		int(config.get_value("meta", "hull_level", 0)),
		0,
		max_meta_level
	)
	progress.weapons_level = clampi(
		int(config.get_value("meta", "weapons_level", 0)),
		0,
		max_meta_level
	)
	progress.thrusters_level = clampi(
		int(config.get_value("meta", "thrusters_level", 0)),
		0,
		max_meta_level
	)
	return progress

func save_progress(progress: Dictionary) -> Error:
	var config := ConfigFile.new()
	config.set_value("save", "schema_version", SCHEMA_VERSION)
	config.set_value("scores", "high_score", maxi(0, int(progress.get("high_score", 0))))
	config.set_value("meta", "frontier_data", maxi(0, int(progress.get("frontier_data", 0))))
	config.set_value("meta", "lifetime_data", maxi(0, int(progress.get("lifetime_data", 0))))
	config.set_value("meta", "completed_runs", maxi(0, int(progress.get("completed_runs", 0))))
	config.set_value("meta", "hull_level", maxi(0, int(progress.get("hull_level", 0))))
	config.set_value("meta", "weapons_level", maxi(0, int(progress.get("weapons_level", 0))))
	config.set_value("meta", "thrusters_level", maxi(0, int(progress.get("thrusters_level", 0))))
	return config.save(save_path)
