class_name FrontierSaveService
extends RefCounted

const SCHEMA_VERSION := 2

var save_path: String
var legacy_paths: Array[String] = []
var last_load_report: Dictionary = {
	"loaded": false,
	"source_path": "",
	"source_schema": 0,
	"rewritten": false,
	"error": OK,
}

func _init(path: String, fallback_paths: Array[String] = []) -> void:
	save_path = path
	legacy_paths = fallback_paths.duplicate()

func default_progress() -> Dictionary:
	return {
		"high_score": 0,
		"frontier_data": 0,
		"lifetime_data": 0,
		"completed_runs": 0,
		"hull_level": 0,
		"weapons_level": 0,
		"thrusters_level": 0,
	}

func load_progress(max_meta_level: int) -> Dictionary:
	var progress: Dictionary = default_progress()
	var source_path: String = _find_readable_path()
	if source_path.is_empty():
		last_load_report = {
			"loaded": false,
			"source_path": "",
			"source_schema": 0,
			"rewritten": false,
			"error": ERR_FILE_NOT_FOUND,
		}
		return progress

	var config := ConfigFile.new()
	var load_error: Error = config.load(source_path)
	if load_error != OK:
		last_load_report = {
			"loaded": false,
			"source_path": source_path,
			"source_schema": 0,
			"rewritten": false,
			"error": load_error,
		}
		return progress

	var source_schema: int = maxi(0, int(config.get_value("save", "schema_version", 0)))
	progress = _read_progress(config, max_meta_level)

	# Older and unversioned saves are normalized into the canonical schema. A
	# future schema is read conservatively but never overwritten by older code.
	var should_rewrite: bool = source_schema <= SCHEMA_VERSION and (
		source_schema < SCHEMA_VERSION or source_path != save_path
	)
	var rewrite_error: Error = OK
	if should_rewrite:
		rewrite_error = save_progress(progress)
		if rewrite_error != OK:
			push_warning("Could not rewrite migrated Frontier save: %s" % error_string(rewrite_error))

	last_load_report = {
		"loaded": true,
		"source_path": source_path,
		"source_schema": source_schema,
		"rewritten": should_rewrite and rewrite_error == OK,
		"error": rewrite_error,
	}
	return progress

func get_last_load_report() -> Dictionary:
	return last_load_report.duplicate(true)

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

func _find_readable_path() -> String:
	var candidates: Array[String] = [save_path]
	for legacy_path: String in legacy_paths:
		if not candidates.has(legacy_path):
			candidates.append(legacy_path)
	for candidate: String in candidates:
		if FileAccess.file_exists(candidate):
			return candidate
	return ""

func _read_progress(config: ConfigFile, max_meta_level: int) -> Dictionary:
	var progress: Dictionary = default_progress()
	progress["high_score"] = maxi(0, _read_first_int(config, [
		["scores", "high_score"],
		["scores", "best_score"],
		["progress", "high_score"],
		["progress", "best_score"],
	], 0))
	progress["frontier_data"] = maxi(0, _read_first_int(config, [
		["meta", "frontier_data"],
		["meta", "data"],
		["progress", "frontier_data"],
		["progress", "data"],
	], 0))
	progress["lifetime_data"] = maxi(0, _read_first_int(config, [
		["meta", "lifetime_data"],
		["progress", "lifetime_data"],
	], int(progress["frontier_data"])))
	progress["completed_runs"] = maxi(0, _read_first_int(config, [
		["meta", "completed_runs"],
		["meta", "runs"],
		["progress", "completed_runs"],
		["progress", "runs"],
	], 0))
	progress["hull_level"] = clampi(_read_first_int(config, [
		["meta", "hull_level"],
		["upgrades", "hull_level"],
		["upgrades", "hull"],
	], 0), 0, max_meta_level)
	progress["weapons_level"] = clampi(_read_first_int(config, [
		["meta", "weapons_level"],
		["upgrades", "weapons_level"],
		["upgrades", "weapons"],
	], 0), 0, max_meta_level)
	progress["thrusters_level"] = clampi(_read_first_int(config, [
		["meta", "thrusters_level"],
		["upgrades", "thrusters_level"],
		["upgrades", "thrusters"],
	], 0), 0, max_meta_level)
	return progress

func _read_first_int(config: ConfigFile, candidates: Array, fallback: int) -> int:
	for candidate: Array in candidates:
		if candidate.size() != 2:
			continue
		var section: String = String(candidate[0])
		var key: String = String(candidate[1])
		if config.has_section_key(section, key):
			return int(config.get_value(section, key, fallback))
	return fallback
