/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   state.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: voussama <voussama@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/18 00:04:38 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/26 14:18:28 by voussama         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
	active_tab_sub, addTouranamentStateSub, currentWeb3AccountSub, finishedMatchesStateSub,
	matchNotificationStateSub, tournament_tab_sub, updateTournamentStateSub, user_state_sub,
	web3_login_sub
} from "./appStore";

type Subscriber<T> = (value: T) => void;

export class State<T> {
	private value: T;
	private subscribers = new Set<Subscriber<T>>();

	constructor(initial: T) {
		this.value = initial;
	}

	// Get current state
	get(): T {
		return this.value;
	}

	// Set new state
	set(newValue: T | Partial<T>) {
		// If object, merge partial updates
		if (
        typeof this.value === "object" && 
        newValue && 
        typeof newValue === "object" &&
        !Array.isArray(this.value) &&
        !Array.isArray(newValue)
    ) {
        this.value = { ...this.value, ...newValue };
    } else {
        this.value = newValue as T;
    }

		// Notify subscribers
		this.subscribers.forEach(fn => fn(this.value));
	}

  // Subscribe to changes
  subscribe(fn: Subscriber<T>) {
    this.subscribers.add(fn);
    fn(this.value); // run once immediately
    return () => this.subscribers.delete(fn);
  }
}


export const subs = () => {
	active_tab_sub();
	web3_login_sub();
	tournament_tab_sub();
	currentWeb3AccountSub();
	addTouranamentStateSub();
	updateTournamentStateSub();
	finishedMatchesStateSub();
	matchNotificationStateSub();
	user_state_sub();
}

