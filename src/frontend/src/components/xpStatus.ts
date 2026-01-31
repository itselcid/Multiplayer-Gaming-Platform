// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   xpStatus.ts                                        :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2026/01/28 18:16:42 by kez-zoub          #+#    #+#             //
//   Updated: 2026/01/28 18:16:42 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Component } from "../core/Component";

const LEVEL_THRESHOLDS = [
	{ level: 1, minXP: 0, maxXP: 150 },
	{ level: 2, minXP: 151, maxXP: 500 },
	{ level: 3, minXP: 501, maxXP: 1000 },
	{ level: 4, minXP: 1001, maxXP: Infinity },
];

interface XPTrackerProps {
	totalXP: number;
}

export class XPTracker extends Component {
	private totalXP: number;

	constructor(props: XPTrackerProps) {
		super('div', 'xp-tracker-container');
		this.totalXP = props.totalXP;
	}

	/**
	 * Get level info based on total XP
	 */
	private getLevelInfo() {
		const xp = this.totalXP;

		// Find current level based on XP
		for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
			const threshold = LEVEL_THRESHOLDS[i];
			if (xp >= threshold.minXP) {
				const isMaxLevel = threshold.level === 4;
				const currentLevelXP = xp - threshold.minXP;
				const xpNeededForLevel = isMaxLevel ? currentLevelXP : (threshold.maxXP - threshold.minXP + 1);
				const xpToNextLevel = isMaxLevel ? 0 : (threshold.maxXP - xp + 1);
				const percentage = isMaxLevel ? 100 : (currentLevelXP / xpNeededForLevel) * 100;

				return {
					level: threshold.level,
					currentLevelXP,
					xpNeededForLevel,
					xpToNextLevel,
					percentage: Math.min(percentage, 100),
					isMaxLevel,
				};
			}
		}

		// Default to level 1
		return {
			level: 1,
			currentLevelXP: xp,
			xpNeededForLevel: 151,
			xpToNextLevel: 151 - xp,
			percentage: (xp / 151) * 100,
			isMaxLevel: false,
		};
	}

	/**
	 * Update XP values and re-render
	 */
	public update(props: Partial<XPTrackerProps>): void {
		if (props.totalXP !== undefined) this.totalXP = props.totalXP;
		this.render();
	}

	render(): void {
		const levelInfo = this.getLevelInfo();
		const radius = 70;
		const circumference = 2 * Math.PI * radius;
		const strokeDashoffset = circumference - (circumference * levelInfo.percentage) / 100;

		this.el.innerHTML = `
			<div class="xp-tracker-inner">
				<!-- Header -->
				<div class="xp-tracker-header">
					<div class="xp-tracker-title-wrapper">
						<svg class="xp-tracker-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
						</svg>
						<h3 class="xp-tracker-title">Level Progress</h3>
					</div>
					<div class="xp-tracker-level-badge">
						LVL ${levelInfo.level}
					</div>
				</div>

				<!-- Circular Progress -->
				<div class="xp-tracker-content">
					<div class="xp-tracker-circle-wrapper">
						<!-- SVG Circle Progress -->
						<svg class="xp-tracker-svg" viewBox="0 0 160 160">
							<defs>
								<linearGradient id="xpProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" style="stop-color: #2dd7ff; stop-opacity: 1" />
									<stop offset="100%" style="stop-color: #b967ff; stop-opacity: 1" />
								</linearGradient>
							</defs>
							
							<!-- Background circle (complete circle, faded) -->
							<circle
								class="xp-tracker-bg-circle"
								cx="80"
								cy="80"
								r="${radius}"
							/>
							
							<!-- Progress circle (colored part based on percentage) -->
							<circle
								class="xp-tracker-progress-circle"
								cx="80"
								cy="80"
								r="${radius}"
								stroke-dasharray="${circumference}"
								stroke-dashoffset="${strokeDashoffset}"
							/>
						</svg>
						
						<!-- Center Content -->
						<div class="xp-tracker-center">
							<div class="xp-tracker-percentage">
								${Math.round(levelInfo.percentage)}%
							</div>
							<div class="xp-tracker-xp-text">
								${levelInfo.currentLevelXP} / ${levelInfo.xpNeededForLevel}
							</div>
						</div>
					</div>

					<!-- XP Details Bar -->
					<div class="xp-tracker-bar-wrapper">
						<!-- Progress Bar -->
						<div class="xp-tracker-bar-container">
							<div 
								class="xp-tracker-bar-fill"
								style="width: ${levelInfo.percentage}%;"
							></div>
						</div>

						<!-- XP to Next Level -->
						<div class="xp-tracker-footer">
							<span class="xp-tracker-footer-label">
								${levelInfo.isMaxLevel ? 'MAX LEVEL REACHED' : 'XP TO NEXT LEVEL'}
							</span>
							<span class="xp-tracker-footer-value">
								${levelInfo.isMaxLevel ? this.totalXP + ' XP TOTAL' : levelInfo.xpToNextLevel + ' XP'}
							</span>
						</div>
					</div>
				</div>
			</div>
		`;
	}
}
