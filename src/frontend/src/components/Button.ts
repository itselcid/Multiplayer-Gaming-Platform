// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Button.ts                                          :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/10/13 19:34:53 by kez-zoub          #+#    #+#             //
//   Updated: 2025/10/13 19:39:13 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Component } from "../core/Component";

export class Button extends Component {
  constructor(
    private text: string,
    private onClick?: () => void
  ) {
    super("button", ["btn"]);
  }

  render() {
    this.el.textContent = this.text;
    this.el.onclick = this.onClick || null;
  }
}

