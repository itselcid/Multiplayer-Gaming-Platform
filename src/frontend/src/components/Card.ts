// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Card.ts                                            :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/10/13 19:36:21 by kez-zoub          #+#    #+#             //
//   Updated: 2025/10/13 19:38:43 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Component } from "../core/Component";
import { Button } from "./Button";

export class Card extends Component {
  constructor(private title: string, private message: string) {
    super("div", ["card"]);
  }

  render() {
    this.el.innerHTML = `
      <h3>${this.title}</h3>
      <p>${this.message}</p>
    `;

    const btn = new Button("Click Me", () => alert("Card clicked!"));
    btn.render();
    this.el.appendChild(btn.el);
  }
}

