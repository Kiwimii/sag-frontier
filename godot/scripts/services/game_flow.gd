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

func transition(next_state: State) -> void:
	state = next_state

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
