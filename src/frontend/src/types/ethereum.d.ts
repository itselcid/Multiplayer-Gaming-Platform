// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   ethereum.d.ts                                      :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/11/06 13:45:05 by kez-zoub          #+#    #+#             //
//   Updated: 2025/11/11 18:25:00 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { MetaMaskInpageProvider } from '@metamask/providers';

declare global {
 interface Window {
   ethereum?: MetaMaskInpageProvider;
 }
}

export {};

