/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   router.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/13 22:19:50 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/12 02:43:55 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Home } from "../components/Home";
import { Page404} from "../components/Page404";
import { MatchView } from "../pages/Match";
import { ProfileView } from "../pages/Profile";
import { TournamentView } from "../pages/Tournament";
import { TournamentsView } from "../pages/Tournaments";
import { Login } from "../pages/login.ts";
import { Register } from "../pages/register.ts";
import { chat } from "../components/chat";
import { Friends } from "../components/Friends";

// --- Route Definitions ---
const routes: Record<string, any> = {
	"/": Home,
	"/home": Home,
	"/profile": ProfileView,
	"/profile/:id": ProfileView,
	"/tournaments": TournamentsView,
	"/tournaments/:id": TournamentView,
	"/match/:key": MatchView,
	"/login": Login,
	"/register": Register,
  	"/chat": chat,
  	"/friends": Friends,
};

// --- Scroll Position Store ---
const scrollPositions = new Map<string, number>();
let lastPath = window.location.pathname;


// Save scroll for current path
function saveScroll(path: string) {
  scrollPositions.set(path, window.scrollY);
}

// Get saved scroll value (0 by default)
function getScroll(path: string) {
  return scrollPositions.get(path) ?? 0;
}


// --- Navigation Function (User-triggered) ---
export function navigate(path: string) {
  saveScroll(lastPath);          // Save scroll before leaving  
  history.pushState({}, "", path);
  lastPath = path;

  renderRoute();

  // New navigation => scroll to top
  requestAnimationFrame(() => window.scrollTo(0, 0));
}


// --- Route Matching ---
export function matchRoute(path: string): { view: any; params: Record<string, string> } | null {
  path = path.replace(/\/+$/, "") || "/";

  for (const pattern in routes) {
    const paramNames: string[] = [];

    const regexPath = pattern.replace(/:([^/]+)/g, (_, key) => {
      paramNames.push(key);
      return "([^/]+)";
    });

    const regex = new RegExp(`^${regexPath}$`);
    const match = path.match(regex);

    if (match) {
      const params: Record<string, string> = {};
      paramNames.forEach((name, i) => (params[name] = match[i + 1]));
      return { view: routes[pattern], params };
    }
  }
  return null;
}


// --- Render Route ---
export async function renderRoute() {
	const root = document.getElementById("bg")!;
	root.innerHTML = "";
	
	const match = matchRoute(location.pathname);

	if (!match) {
		new Page404().mount(root);
		return;
	}

	const { view: View, params } = match;

	new View(params).mount(root);
}


// --- Browser Back/Forward Handling ---
window.addEventListener("popstate", () => {
  const path = window.location.pathname;

  renderRoute();

  // Restore scroll from history
  requestAnimationFrame(() => {
    window.scrollTo(0, getScroll(path));
  });

  lastPath = path;
});
