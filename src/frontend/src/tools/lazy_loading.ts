/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lazy_loading.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/13 14:39:29 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/13 16:03:39 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { get_tournament_batch } from "../web3/getters";

export let observer: IntersectionObserver | null = null;

export const	lazy_load = (trigger: HTMLElement) => {
	observer = new IntersectionObserver(
		async (entries) => {
			if (entries[0].isIntersecting) {
				await get_tournament_batch(10);
			}
		},
		{
			root: null,      // viewport
			threshold: 0.1,
		}
	);
	
	observer.observe(trigger);
}

