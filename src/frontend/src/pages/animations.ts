import { addElement, Component } from "../core/Component";

export class Particels extends Component {
	constructor() {
		super('div', 'fixed inset-0 z-0');
	}

	render(): void {
		addElement('div', 'absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950', this.el);

		// Optimized: Use radial-gradient instead of blur-3xl for better performance on VMs
		const animation1 = addElement('div', 'absolute top-0 left-1/4 w-96 h-96 animate-pulse', this.el);
		animation1.style.background = 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, rgba(0,0,0,0) 70%)';
		animation1.style.animationDuration = '4s';

		const animation2 = addElement('div', 'absolute bottom-0 right-1/4 w-96 h-96 animate-pulse', this.el);
		animation2.style.background = 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(0,0,0,0) 70%)';
		animation2.style.animationDuration = '6s';
		animation2.style.animationDelay = '1s';

		const animation3 = addElement('div', 'absolute top-1/2 left-1/2 w-96 h-96 animate-pulse', this.el);
		animation3.style.background = 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0) 70%)';
		animation3.style.animationDuration = '8s';
		animation3.style.animationDelay = '2s';

		const particles = addElement('div', 'absolute inset-0', this.el);
		// Reduced particles from 50 to 30 for better performance
		[...Array(30)].map(() => (
			addElement('div', 'absolute w-1 h-1 bg-cyan-400/40 rounded-full', particles).style.cssText = `
			left: ${Math.random() * 100}%;
			top: ${Math.random() * 100}%;
			animation: float ${10 + Math.random() * 20}s linear infinite;
			animation-delay: -${Math.random() * 20}s;
		`))

		const style = addElement('style', '', this.el);
		style.textContent = `
		@keyframes float {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(${Math.random() * 200 - 100}px, -100vh); opacity: 0; }
        }

		`
	}
}
