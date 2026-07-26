class_name FrontierGameFlow
extends RefCounted

enum State {
	COMMAND,
	RUNNING,
	UPGRADE,
	ROUTE,
	PAUSED,
	RESULT,
}

var state: State = State.COMMAND
var last_rejected_transition: Dictionary = {}

func transition(next_state: State) -> bool:
	if next_state == state:
		return true
	if not can_transition_to(next_state):
		last_rejected_transition = {
			"from": state,
			"to": next_state,
		}
		push_warning("Rejected Frontier flow transition %s -> %s" % [
			State.keys()[state],
			State.keys()[next_state],
		])
		return false
	state = next_state
	last_rejected_transition.clear()
	return true

func can_transition_to(next_state: State) -> bool:
	if next_state == state:
		return true
	match state:
		State.COMMAND:
			return next_state == State.RUNNING
		State.RUNNING:
			return next_state in [State.UPGRADE, State.ROUTE, State.PAUSED, State.RESULT]
		State.UPGRADE:
			return next_state in [State.RUNNING, State.RESULT]
		State.ROUTE:
			return next_state in [State.RUNNING, State.RESULT]
		State.PAUSED:
			return next_state in [State.RUNNING, State.RESULT]
		State.RESULT:
			return next_state in [State.COMMAND, State.RUNNING]
	return false

func is_run_active() -> bool:
	return state in [State.RUNNING, State.UPGRADE, State.ROUTE, State.PAUSED]

func can_simulate() -> bool:
	return state == State.RUNNING

func is_paused() -> bool:
	return state == State.PAUSED

func is_choosing_upgrade() -> bool:
	return state == State.UPGRADE

func is_choosing_route() -> bool:
	return state == State.ROUTE

func is_finalized() -> bool:
	return state == State.RESULT

func can_toggle_pause() -> bool:
	return state == State.RUNNING or state == State.PAUSED
