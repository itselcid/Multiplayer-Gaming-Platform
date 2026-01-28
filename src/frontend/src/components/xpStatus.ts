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

interface XPTrackerProps {
    currentXP: number;
    maxXP: number;
    level?: number;
}

export class XPTracker extends Component {
    private currentXP: number;
    private maxXP: number;
    private level: number;

    constructor(props: XPTrackerProps) {
        super('div', 'xp-tracker-container');
        this.currentXP = props.currentXP;
        this.maxXP = props.maxXP;
        this.level = props.level ?? 12;
    }

    /**
     * Update XP values and re-render
     */
    public update(props: Partial<XPTrackerProps>): void {
        if (props.currentXP !== undefined) this.currentXP = props.currentXP;
        if (props.maxXP !== undefined) this.maxXP = props.maxXP;
        if (props.level !== undefined) this.level = props.level;
        this.render();
    }

    render(): void {
        const percentage = (this.currentXP / this.maxXP) * 100;
        const radius = 70;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (circumference * percentage) / 100;
        const xpToNextLevel = this.maxXP - this.currentXP;

        this.el.innerHTML = `
			<style>
				.xp-tracker-container {
					border-radius: 0.75rem;
					overflow: hidden;
					width: 100%;
					background: linear-gradient(135deg, rgba(10, 22, 40, 0.9) 0%, rgba(30, 11, 61, 0.9) 100%);
					border: 2px solid rgba(45, 215, 255, 0.3);
					box-shadow: 0 0 20px rgba(45, 215, 255, 0.2);
				}

				.xp-tracker-inner {
					padding: 1.5rem;
				}

				.xp-tracker-header {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-bottom: 1.25rem;
				}

				.xp-tracker-title-wrapper {
					display: flex;
					align-items: center;
					gap: 0.5rem;
				}

				.xp-tracker-icon {
					width: 1.25rem;
					height: 1.25rem;
					color: #2dd7ff;
					filter: drop-shadow(0 0 4px #2dd7ff);
				}

				.xp-tracker-title {
					font-family: 'Audiowide', sans-serif;
					font-size: 14px;
					color: white;
					margin: 0;
				}

				.xp-tracker-level-badge {
					padding: 0.25rem 0.75rem;
					border-radius: 0.25rem;
					font-family: 'Audiowide', sans-serif;
					font-size: 11px;
					background: rgba(45, 215, 255, 0.2);
					border: 1px solid rgba(45, 215, 255, 0.4);
					color: #2dd7ff;
					box-shadow: 0 0 10px rgba(45, 215, 255, 0.3);
				}

				.xp-tracker-content {
					display: flex;
					flex-direction: column;
					align-items: center;
				}

				.xp-tracker-circle-wrapper {
					position: relative;
					width: 160px;
					height: 160px;
					margin-bottom: 1rem;
				}

				.xp-tracker-svg {
					display: block;
					width: 100%;
					height: 100%;
					transform: rotate(-90deg);
				}

				.xp-tracker-bg-circle {
					stroke: rgba(45, 215, 255, 0.15);
					stroke-width: 10;
					fill: none;
					stroke-linecap: round;
				}

				.xp-tracker-progress-circle {
					stroke: url(#xpProgressGradient);
					stroke-width: 10;
					fill: none;
					stroke-linecap: round;
					transition: stroke-dashoffset 1s ease-out;
					filter: drop-shadow(0px 0px 10px #3AD7FC);
				}

				.xp-tracker-center {
					position: absolute;
					inset: 0;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
				}

				.xp-tracker-percentage {
					font-family: 'Zen Dots', sans-serif;
					font-size: 28px;
					color: #2dd7ff;
					margin-bottom: 0.25rem;
					text-shadow: 0px 0px 20px rgba(45, 215, 255, 0.8);
				}

				.xp-tracker-xp-text {
					font-family: 'Zen Dots', sans-serif;
					font-size: 11px;
					color: rgba(255, 255, 255, 0.5);
				}

				.xp-tracker-bar-wrapper {
					width: 100%;
				}

				.xp-tracker-bar-container {
					width: 100%;
					height: 0.5rem;
					border-radius: 9999px;
					overflow: hidden;
					position: relative;
					background: rgba(10, 22, 40, 0.5);
					border: 1px solid rgba(45, 215, 255, 0.2);
					margin-bottom: 0.5rem;
				}

				.xp-tracker-bar-fill {
					height: 100%;
					transition: width 1s ease-out;
					border-radius: 9999px;
					position: absolute;
					top: 0;
					left: 0;
					background: linear-gradient(90deg, #2dd7ff 0%, #b967ff 100%);
					box-shadow: 0 0 10px rgba(45, 215, 255, 0.5);
				}

				.xp-tracker-footer {
					display: flex;
					align-items: center;
					justify-content: space-between;
				}

				.xp-tracker-footer-label {
					font-family: 'Zen Dots', sans-serif;
					font-size: 9px;
					color: rgba(255, 255, 255, 0.5);
				}

				.xp-tracker-footer-value {
					font-family: 'Audiowide', sans-serif;
					font-size: 10px;
					color: #2dd7ff;
				}
			</style>

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
						LVL ${this.level}
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
								${Math.round(percentage)}%
							</div>
							<div class="xp-tracker-xp-text">
								${this.currentXP} / ${this.maxXP}
							</div>
						</div>
					</div>

					<!-- XP Details Bar -->
					<div class="xp-tracker-bar-wrapper">
						<!-- Progress Bar -->
						<div class="xp-tracker-bar-container">
							<div 
								class="xp-tracker-bar-fill"
								style="width: ${percentage}%;"
							></div>
						</div>

						<!-- XP to Next Level -->
						<div class="xp-tracker-footer">
							<span class="xp-tracker-footer-label">
								XP TO NEXT LEVEL
							</span>
							<span class="xp-tracker-footer-value">
								${xpToNextLevel} XP
							</span>
						</div>
					</div>
				</div>
			</div>
		`;
    }
}
