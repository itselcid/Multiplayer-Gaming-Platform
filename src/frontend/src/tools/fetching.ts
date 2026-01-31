/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   fetching.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/08 15:57:04 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/30 20:45:30 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { throwCustomError } from "./errors";

export const isUsernameTaken = async (username: string): Promise<boolean> => {
	// const VITE_USER_BACKEND_URL = import.meta.env.VITE_USER_BACKEND_URL;
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5000); // 5s

	if (username.length < 3)
		throwCustomError("Username length invalid");

	try {
		const response = await fetch(
			"/api/users/istaken",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username }),
				signal: controller.signal,
			}
		);
		clearTimeout(timeout);

		if (response.status === 200) return (false);
		else if (response.status === 409) return (true);

		throwCustomError(`HTTP ${response.status}: ${response.statusText}`);
	} catch (err: any) {
		if (err.name === "AbortError") {
			throwCustomError("User service timed out");
		}
		throwCustomError("User service is unavailable");
	}
	throw new Error("Unreachable");
};
