/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   match_history.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: antigravity <antigravity@student.1337.ma>  +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/26 13:30:00 by antigravity       #+#    #+#             */
/*   Updated: 2026/01/26 14:40:00 by antigravity      ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { addElement, Component } from "../core/Component";

// Define interface matching backend
interface MatchHistory {
    player1Id: number;
    player1: {
        id: number;
        username: string;
        avatar: string;
    };
    player2Id: number;
    player2: {
        id: number;
        username: string;
        avatar: string;
    };
    player1Score: number;
    player2Score: number;
    playedAt: string; // JSON date comes as string
}

// Fetch function
const fetchMatchHistory = async (userId: string): Promise<MatchHistory[]> => {
    try {
        const response = await fetch(`/api/users/${userId}/history`);
        if (!response.ok) {
            throw new Error(`Error fetching history: ${response.statusText}`);
        }
        const data = await response.json();
        // Backend controller wraps it in { historyData: [...] }
        return data.historyData || [];
    } catch (error) {
        console.error("Failed to fetch match history", error);
        return [];
    }
}

export class Match_history extends Component {
    private _userId: string;

    constructor(userId: string = 'me') {
        super('div', 'lg:col-span-2');
        this._userId = userId;
    }

    async render(): Promise<void> {
        // Wrapper container similar to Tournament_history
        const containerInfo = addElement('div', 'bg-gradient-to-br from-space-blue to-space-dark border border-neon-cyan/30 rounded-xl p-6', this.el);

        // Header
        containerInfo.innerHTML = `
            <h3 class="text-2xl font-bold mb-6 text-neon-cyan flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-6 h-6 mr-2" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>
                </svg>
                Match History
            </h3>
        `;

        const matchesList = addElement('div', 'space-y-4', containerInfo);

        // Fetch Data
        const historyData = await fetchMatchHistory(this._userId);

        if (historyData.length === 0) {
            matchesList.innerHTML = `
                <div class="text-center p-8 text-gray-400">
                    No matches found.
                </div>
            `;
            return;
        }

        historyData.forEach(match => {
            const player1Won = match.player1Score > match.player2Score;

            const p1Result = player1Won ? 'WIN' : 'LOSS';
            const p1ResultClass = player1Won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';

            const dateStr = match.playedAt ? new Date(match.playedAt).toLocaleDateString() : 'Unknown';

            const itemHTML = `
                <div class="bg-space-dark/50 border border-neon-purple/20 rounded-lg p-4 hover:border-neon-purple/50 transition-all">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center space-x-4">
                            <div class="px-4 py-2 rounded-lg font-bold ${p1ResultClass}">
                                ${p1Result}
                            </div>
                            <div>
                                <div class="text-white font-semibold">
                                     ${match.player1.username} <span class="text-gray-500 text-xs">vs</span> ${match.player2.username}
                                </div>
                                <div class="text-gray-400 text-sm">
                                    ${dateStr}
                                </div>
                            </div>
                        </div>
                        <div class="text-2xl font-bold text-neon-cyan">
                            ${match.player1Score}-${match.player2Score}
                        </div>
                    </div>
                     <div class="flex items-center space-x-2 text-sm text-gray-500">
                        <!-- Placeholder for verification if needed, or just metadata -->
                    </div>
                </div>
            `;
            matchesList.insertAdjacentHTML('beforeend', itemHTML);
        });
    }
}
