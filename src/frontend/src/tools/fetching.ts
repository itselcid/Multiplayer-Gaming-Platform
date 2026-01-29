/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   fetching.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/08 15:57:04 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/23 22:42:44 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export const	isUsernameTaken = async (username: string): Promise<boolean> => {
	const	VITE_USER_BACKEND_URL = import.meta.env.VITE_USER_BACKEND_URL;
	const	data = {
		"username": username
	}
	const	response = await fetch('/api/users/istaken', {
		method: "POST",
		headers: {
		"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	if (response.status === 200)
		return (false);
	else if (response.status === 409)
		return (true);
	const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.shortMessage = `HTTP ${response.status}: ${response.statusText}`;
    throw error;
}