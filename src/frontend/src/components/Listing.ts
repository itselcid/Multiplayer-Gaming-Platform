// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Listing.ts                                         :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/10/14 15:01:38 by kez-zoub          #+#    #+#             //
//   Updated: 2025/10/19 14:49:36 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Component } from "../core/Component";
import { Navbar } from "./Navbar";
import { List_item } from "./List_item"

interface List {
	id: number,
	title: string,
	description: string,
	price: string,
	image: string,
}

let lists: List[] = [
	{
		"id": 1,
		"title": "Modern Loft Apartment",
		"description": "A spacious and stylish loft located in the heart of the city.",
		"price": "1,200",
		"image": "https://placehold.co/600x400/1e293b/94a3b8?text=Loft"
	},
	{
		"id": 2,
		"title": "Cozy Cottage",
		"description": "A peaceful retreat surrounded by nature and serenity.",
		"price": "900",
		"image": "https://placehold.co/600x400/1e293b/94a3b8?text=Cottage"
	},
	{
		"id": 3,
		"title": "Downtown Studio",
		"description": "Compact and efficient, perfect for young professionals.",
		"price": "750",
		"image": "https://placehold.co/600x400/1e293b/94a3b8?text=Studio"
	},
	{
		"id": 4,
		"title": "Luxury Villa",
		"description": "An elegant villa with a private pool and panoramic views.",
		"price": "3,500",
		"image": "https://placehold.co/600x400/1e293b/94a3b8?text=Villa"
	},
	{
		"id": 5,
		"title": "1337",
		"description": "description of 1337",
		"price": "bzf",
		"image": "https://1337.ma/static/b8296aebbcc7fb3ce15ae9e4a66d82fa/25252/cluster.jpg"
	},
	{
		"id": 6,
		"title": "test",
		"description": "test",
		"price": "test",
				"image": "https://1337.ma/static/b8296aebbcc7fb3ce15ae9e4a66d82fa/25252/cluster.jpg"
	}
];

export class Listing extends Component {
	constructor() {
		super("div");
		this.el.className = "min-h-screen bg-slate-950 pt-24 px-6"
	}

	render() {
		const navbar = new Navbar();
		navbar.mount(this.el);

		const container = document.createElement("div");
		container.className = "max-w-6xl mx-auto";

		const header = document.createElement("h2");
		header.className = "text-3xl font-bold text-sky-400 mb-6";
		header.textContent = "Latest Listings";
		container.append(header);

		const listing_container = document.createElement("div");
		listing_container.className = "listing-container grid gap-6 sm:grid-cols-2 lg:grid-cols-3";
		lists.forEach((item: List) => {
			const list_item = new List_item(item.id, item.title, item.description, item.price, item.image);
			list_item.mount(listing_container);
		});
		container.append(listing_container);

		this.el.append(container);
	}
}



