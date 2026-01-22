/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   fetching.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/08 15:57:04 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/08 17:14:12 by kez-zoub         ###   ########.fr       */
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