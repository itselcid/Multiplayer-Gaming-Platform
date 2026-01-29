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
import { userState } from "../core/appStore";
import { navigate } from "../core/router";

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
const fetchMatchHistory = async (userId: string, page: number = 1, limit: number = 10): Promise<MatchHistory[]> => {
    try {
        const response = await fetch(`/api/users/${userId}/history?page=${page}&limit=${limit}`);
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
    private _targetUserId: number | null = null; // The user whose profile we're viewing
    private _page: number;
    private _limit: number;

    constructor(userId: string = 'me', targetUserId?: number) {
        super('div', 'lg:col-span-2');
        this._userId = userId;
        this._targetUserId = targetUserId ?? null;
        this._page = 1;
        this._limit = 5;
    }

    async render(): Promise<void> {
        // Clear existing content
        this.el.innerHTML = '';

        // Wrapper container similar to Tournament_history
        const containerInfo = addElement('div', 'bg-gradient-to-br from-space-blue to-space-dark border border-neon-cyan/30 rounded-xl p-6', this.el);

        // Header with pagination buttons
        const headerDiv = addElement('div', 'flex items-center justify-between mb-6', containerInfo);

        headerDiv.innerHTML = `
            <h3 class="text-2xl font-bold text-neon-cyan flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-6 h-6 mr-2" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>
                </svg>
                Match History
            </h3>
            <div class="flex items-center space-x-2">
                <span class="text-gray-400 text-sm mr-2">Page ${this._page}</span>
                <button id="prev-page-btn" class="px-3 py-1 bg-neon-purple/20 hover:bg-neon-purple/40 text-neon-purple border border-neon-purple/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed" ${this._page <= 1 ? 'disabled' : ''}>
                    Previous
                </button>
                <button id="next-page-btn" class="px-3 py-1 bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan border border-neon-cyan/50 rounded-lg transition-all">
                    Next
                </button>
            </div>
        `;

        const matchesList = addElement('div', 'space-y-4', containerInfo);

        // Fetch Data
        const historyData = await fetchMatchHistory(this._userId, this._page, this._limit);

        if (historyData.length === 0) {
            matchesList.innerHTML = `
                <div class="text-center p-8 text-gray-400">
                    No matches found.
                </div>
            `;
            // Disable next button if no data
            const nextBtn = document.getElementById('next-page-btn') as HTMLButtonElement;
            if (nextBtn) nextBtn.disabled = true;
        } else {
            // Get the user ID for perspective (profile being viewed, or current user)
            const currentUser = userState.get();
            const perspectiveUserId = this._targetUserId ?? currentUser?.id;

            historyData.forEach(match => {
                // Determine if the profile user won based on their actual position in the match
                let profileUserWon = false;
                let profileUserScore = 0;
                let opponentScore = 0;
                let opponent: { id: number; username: string; avatar: string };

                if (perspectiveUserId === match.player1Id) {
                    // Profile user is player1
                    profileUserWon = match.player1Score > match.player2Score;
                    profileUserScore = match.player1Score;
                    opponentScore = match.player2Score;
                    opponent = match.player2;
                } else if (perspectiveUserId === match.player2Id) {
                    // Profile user is player2
                    profileUserWon = match.player2Score > match.player1Score;
                    profileUserScore = match.player2Score;
                    opponentScore = match.player1Score;
                    opponent = match.player1;
                } else {
                    // Fallback: assume player1 is the profile user
                    profileUserWon = match.player1Score > match.player2Score;
                    profileUserScore = match.player1Score;
                    opponentScore = match.player2Score;
                    opponent = match.player2;
                }

                const result = profileUserWon ? 'WIN' : 'LOSS';
                const resultClass = profileUserWon ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';

                const dateStr = match.playedAt ? new Date(match.playedAt).toLocaleDateString() : 'Unknown';

                const itemHTML = `
                    <div class="bg-space-dark/50 border border-neon-purple/20 rounded-lg p-4 hover:border-neon-purple/50 transition-all">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center space-x-4">
                                <div class="px-4 py-2 rounded-lg font-bold ${resultClass}">
                                    ${result}
                                </div>
                                <div>
                                    <div class="text-white font-semibold">
                                         vs <span class="profile-link cursor-pointer hover:text-neon-cyan hover:underline transition-colors" data-user-id="${opponent.id}">${opponent.username}</span>
                                    </div>
                                    <div class="text-gray-400 text-sm">
                                        ${dateStr}
                                    </div>
                                </div>
                            </div>
                            <div class="text-2xl font-bold text-neon-cyan">
                                ${profileUserScore}-${opponentScore}
                            </div>
                        </div>
                         <div class="flex items-center space-x-2 text-sm text-gray-500">
                            <!-- Placeholder for verification if needed, or just metadata -->
                        </div>
                    </div>
                `;
                matchesList.insertAdjacentHTML('beforeend', itemHTML);
            });

            // Disable next button if we got less data than the limit (last page)
            if (historyData.length < this._limit) {
                const nextBtn = document.getElementById('next-page-btn') as HTMLButtonElement;
                if (nextBtn) nextBtn.disabled = true;
            }
        }

        // Add event listeners for pagination buttons
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.loadPage(this._page - 1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.loadPage(this._page + 1));
        }

        // Add click handlers for profile links
        this.el.querySelectorAll('.profile-link').forEach(el => {
            el.addEventListener('click', () => {
                const userId = (el as HTMLElement).dataset.userId;
                if (userId) {
                    navigate(`/profile/${userId}`);
                }
            });
        });
    }

    private async loadPage(page: number): Promise<void> {
        if (page < 1) return;
        this._page = page;
        await this.render();
    }
}
