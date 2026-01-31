/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   router.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/13 22:19:50 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/24 15:40:41 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Home } from "../components/Home";
import { Page404 } from "../components/Page404";
// import { MatchView } from "../pages/Match";
import { ProfileView } from "../pages/Profile";
import { TournamentView } from "../pages/Tournament";
import { TournamentsView } from "../pages/Tournaments";
import { Login } from "../components/Login";
import { Register } from "../components/Register";
import { ForgotPassword } from "../components/ForgotPassword";
import { chat } from "../components/chat";
import { Friends } from "../components/Friends";
import { Game } from "../pages/Game";
import { userState, authLoading } from "../core/appStore";
import { ResetPassword } from "../components/ResetPassword";
import { TwoFactorVerify } from "../components/TwoFactorVerify";
// --- Route Definitions ---
const routes: Record<string, any> = {
  "/": Home,
  "/home": Home,
  "/profile": ProfileView,
  "/profile/:id": ProfileView,
  "/tournaments": TournamentsView,
  "/tournaments/:id": TournamentView,
  "/match/:key": Game,
  "/login": Login,
  "/login/verify": TwoFactorVerify,
  "/register": Register,
  "/forgot-password": ForgotPassword,
  "/reset-password": ResetPassword,
  "/chat": chat,
  "/friends": Friends,
  "/game": Game,
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

export async function renderRoute() {
  const user = userState.get();
  const root = document.getElementById("bg")!;
  root.innerHTML = ``;

  const match = matchRoute(location.pathname);
  if (!match) {
    const page = new Page404();
    page.mount(root);
    return;
  }

  // 1. Loading State
  if (authLoading.get()) {
    // Show a minimal loading state while we verify session
    root.innerHTML = `
      <div class="fixed inset-0 flex items-center justify-center bg-space-dark z-50">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
      </div>
    `;
    return;
  }

  const { view: View, params } = match;

  // Check if the target view is an overlay (Login or Register)
  // Note: With the guards above, a logged-in user won't reach here for Login/Register,
  // and a logged-out user won't reach here for Protected routes.
  const isOverlay = (View === Login || View === Register || View === TwoFactorVerify);
  
  // Remove any existing overlay if we are navigating
  const existingAuthOverlay = document.getElementById('auth-overlay');
  if (existingAuthOverlay) {
    existingAuthOverlay.remove();
  }
  const existingTwofaOverlay = document.getElementById('twofa-overlay');
  if (existingTwofaOverlay) {
    existingTwofaOverlay.remove();
  }
  
  if (isOverlay) {
    // If we are opening an overlay, ensure there is a background page.
    // If the root is empty (e.g. direct load of /login), render Home as background.
    if (root.children.length === 0) {
      const home = new Home();
      home.mount(root);
    }

    // Mount the overlay
    const page = new View(params);
    page.mount(root);
  }
  else if(View === Game ||(!user && (View === chat || View === Friends)) ){
        const key = match.params;
        if(View === Game && key && key.key){
          const gameobj  = new Game(key.key);
          // console.log("wikwik");
          if(!(await gameobj.verify())){
            const page = new Page404();
            page.mount(root);
            return;
          }
          gameobj.mount(root);
        }
        else if(!user){
          const page = new Login();
          page.mount(root);
          return;
        }
        else if(View === Game) {
          // console.log("waaayli");
          const urlParams = new URLSearchParams(window.location.search);
          let mode = urlParams.get("mode") || "bot";
          const id = urlParams.get("id") || "";
          const gameobj = new Game(id,mode);
          if(!mode || (mode !== "bot" && mode !== "local" && mode != "remote")){
            mode = "bot"; 
          }
          if(mode == "remote" && (!id || !(await gameobj.verify()))){
            const page = new Page404();
            page.mount(root);
            return;
          }
          gameobj.mount(root);
        }
  }
  else {
      const page = new View(params);
      page.mount(root);
    }

//  else {
//     // Normal navigation: Clear everything and mount the new page
//     root.innerHTML = "";

//     if (View === Game) {
//       if (user) {
//         const urlParams = new URLSearchParams(window.location.search);
//         let mode = urlParams.get("mode") || "bot";
//         const id = urlParams.get("id") || "";
//         if (!mode || (mode !== "bot" && mode !== "local" && mode !== "remote")) {
//           mode = "bot";
//         }
//         const gameobj = new Game(mode, id);
//         if (mode == "remote" && (!id || !(await gameobj.verify()))) {
//           const page = new Page404();
//           page.mount(root);
//           return;
//         }
//         gameobj.mount(root);
//       } else {
//         const page = new Login();
//         page.mount(root);
//       }
//     } else {
//       const page = new View(params);
//       page.mount(root);
//     }
//   }
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
