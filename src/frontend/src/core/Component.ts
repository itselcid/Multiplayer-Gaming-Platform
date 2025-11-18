/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Component.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/13 19:29:22 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/18 03:29:02 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export abstract class Component {
  el: HTMLElement;

  constructor(tag = "div", classes: string = '') {
    this.el = document.createElement(tag);
    if (classes.length) this.el.className = classes;
  }

  // Method every component must implement
  abstract render(): void;

  mount(parent: HTMLElement) {
    this.render();
    parent.appendChild(this.el);
  }

  unmount() {
    this.el.remove();
  }
}

export function addElement(elTag: string, elClasses?: string, elParent?: HTMLElement): HTMLElement {
	const	el = document.createElement(elTag);
	if (elClasses)
		el.className = elClasses;
	if (elParent)
		elParent.append(el);
	return (el);
}

