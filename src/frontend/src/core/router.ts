/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   router.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/13 22:19:50 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/16 21:21:14 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Home } from "../components/Home";
import { Page404} from "../components/Page404";
import { Profile } from "../pages/Profile";
import { Tournaments } from "../pages/Tournaments";

const routes: Record<string, any> = {
  "/": Home,
  "/home": Home,
  "/profile": Profile,
  "/tournaments": Tournaments,
};

export function navigate(path: string) {
  history.pushState({}, "", path);
  renderRoute();
}

function matchRoute(path: string): { view: any; params: Record<string, string> } | null {
	// normalize: remove trailing slashes (but keep root "/")
	path = path.replace(/\/+$/, "") || "/";


  for (const pattern in routes) {
    const paramNames: string[] = [];

    // Convert '/profile/:id' into regex: /^\/profile\/([^/]+)$/
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

export function renderRoute() {
  const root = document.getElementById("bg")!;
  root.innerHTML = "";

  const match = matchRoute(location.pathname);
  if (!match) {
    const page = new Page404();
    page.mount(root);
    return;
  }

  const { view: View, params } = match;
  const page = new View(params);
  page.mount(root);
}

window.addEventListener("popstate", renderRoute);

