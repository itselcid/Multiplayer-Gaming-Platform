/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Player_card.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/06 01:50:41 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/12 02:42:24 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { login_state } from "../core/appStore";
import { addElement, Component } from "../core/Component";
import { Disconnect_wallet } from "./Disconnect_wallet";

import { userState } from "../core/appStore";  // Change from login_state
import { AuthService } from "../services/auth";

export class Player_card extends Component {
	constructor() {
		super('div', 'bg-gradient-to-br from-space-blue to-space-dark border border-neon-cyan/30 rounded-xl p-6');
	}

	render(): void {


		const user = userState.get();  
		//   Set display values based on user state
		const displayName = user ? user.username : 'Guest';
		const displayEmail = user ? user.email : 'Not logged in';
		const displayAvatar = user ? user.username.charAt(0).toUpperCase() : '?';


		const	pfp = addElement('div', 'w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-4xl', this.el);
		pfp.textContent = displayAvatar;
		
		const	player_name = addElement('h2', 'text-2xl font-bold text-center mb-6 text-neon-cyan', this.el);
		player_name.textContent = displayName;

		const	email_address = addElement('div', 'space-y-4', this.el);
		email_address.insertAdjacentHTML('beforeend', `
														 <div class="flex items-center space-x-3 p-3 bg-space-dark/50 rounded-lg">
														 	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail w-5 h-5 text-neon-cyan" aria-hidden="true"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path><rect x="2" y="4" width="20" height="16" rx="2"></rect>
															 </svg>
														 	<span class="text-gray-300 text-sm">
														 		${displayEmail}
														 	</span>
														 </div>
														 `);
		email_address.insertAdjacentHTML('beforeend', `
														   <div class="flex items-center space-x-3 p-3 bg-space-dark/50 rounded-lg">
														   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet w-5 h-5 text-neon-cyan" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
															   </svg>
															
   <div class="relative inline-block cursor-pointer group">
    <span class="text-gray-300 text-sm font-mono">
	 0X26A2BF1978...71A973CF
</span>

    <!-- Popup -->
    <div
        class="
            absolute 
            bottom-[calc(100%+10px)] left-[60%]
            -translate-x-1/2 
            opacity-0 invisible 
            group-hover:opacity-100 group-hover:visible group-hover:-translate-y-1 
            transition-all duration-300 
            px-5 py-3
            text-[13px]
            font-mono tracking-wide text-neon-cyan
            bg-gradient-to-br from-[rgba(0,242,254,0.15)] to-[rgba(181,55,255,0.15)]
            backdrop-blur-xl
            border-2 border-neon-cyan
            rounded-xl
            shadow-[0_8px_32px_rgba(0,242,254,0.3),0_0_20px_rgba(181,55,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]
            whitespace-nowrap 
            pointer-events-none
            z-[1000]
        "
    >
        0x26A2BF197820C79150DDE3DB793C23BF71A973CF

        <!-- Arrow -->
        <span
            class="
                absolute top-full left-1/2 -translate-x-1/2
                border-8 border-transparent
                border-t-neon-cyan
            "
        ></span>

        <span
            class="
                absolute top-full left-1/2 -translate-x-1/2 mt-[-2px]
                border-6 border-transparent
                border-t-[rgba(0,242,254,0.15)]
            "
        ></span>
    </div>
</div>


</div>
`);


		const	disconnect_logout = addElement('div', 'mt-6 space-y-3', this.el);

		// Only show logout button if user is logged in
		if (user) {
			const logoutBtn = addElement('button', 'w-full py-3 bg-space-dark border border-gray-600 rounded-lg font-bold hover:border-gray-400 transition-all flex items-center justify-center space-x-2', disconnect_logout);
			
			logoutBtn.innerHTML = `
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out w-5 h-5" aria-hidden="true">
				<path d="m16 17 5-5-5-5"></path>
				<path d="M21 12H9"></path>
				<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
				</svg>
				<span>Log Out</span>
			`;
			
			// Add click handler
			logoutBtn.addEventListener('click', async () => {
				await AuthService.logout();
				// Redirect to home or login
				window.location.href = '/login';  // Or use navigate('/login')
			});
		}


	// 	const	disconnect_container = addElement('div', '', disconnect_logout);
	// 	disconnect_container.id = 'disconnect_container';
	// 	if (login_state.get() === 'connected') {
	// 		const	disconnect = new Disconnect_wallet();
	// 		disconnect.mount(disconnect_container);
	// 	}
	// 	disconnect_logout.insertAdjacentHTML('beforeend', `
	// 														  <button class="w-full py-3 bg-space-dark border border-gray-600 rounded-lg font-bold hover:border-gray-400 transition-all flex items-center justify-center space-x-2">
	// 														  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out w-5 h-5" aria-hidden="true"><path d="m16 17 5-5-5-5"></path><path d="M21 12H9"></path><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
	// 															  </svg>
	// 														  <span>
	// 														  Log Out
	// 														  </span>
	// 														  </button>
	// 														  `);
		
	}
}

