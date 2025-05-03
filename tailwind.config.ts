
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				heading: ['Poppins', 'sans-serif'],
				quicksand: ['Quicksand', 'sans-serif'],
				gaming: ['Orbitron', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: "hsl(var(--background))",
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				cuephoria: {
					purple: '#6E59A5',
					lightpurple: '#9b87f5',
					orange: '#F97316',
					blue: '#0EA5E9',
					green: '#10B981',
					dark: '#1A1F2C',
					darker: '#161b27',
					light: '#F1F0FB',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'neon-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 5px rgba(155, 135, 245, 0.5), 0 0 10px rgba(155, 135, 245, 0.3), 0 0 15px rgba(155, 135, 245, 0.1)'
					},
					'50%': { 
						boxShadow: '0 0 10px rgba(155, 135, 245, 0.8), 0 0 20px rgba(155, 135, 245, 0.5), 0 0 30px rgba(155, 135, 245, 0.3)'
					}
				},
				'border-flow': {
					'0%, 100%': { 
						backgroundPosition: '0% 50%' 
					},
					'50%': { 
						backgroundPosition: '100% 50%' 
					}
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% center' },
					'100%': { backgroundPosition: '200% center' }
				},
				'hover-bounce': {
					'0%, 100%': { transform: 'translateY(-2px)' },
					'50%': { transform: 'translateY(2px)' }
				},
				'background-pan': {
					'0%': { backgroundPosition: '0% center' },
					'100%': { backgroundPosition: '-200% center' }
				},
				'text-gradient-flow': {
					'0%, 100%': {
						'background-size': '200%',
						'background-position': 'left center'
					},
					'50%': {
						'background-position': 'right center'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-soft': 'pulse-soft 3s infinite ease-in-out',
				'float': 'float 5s infinite ease-in-out',
				'wiggle': 'wiggle 1s ease-in-out infinite',
				'spin-slow': 'spin-slow 8s linear infinite',
				'neon-pulse': 'neon-pulse 2s infinite ease-in-out',
				'border-flow': 'border-flow 3s ease infinite',
				'shimmer': 'shimmer 2s infinite linear',
				'hover-bounce': 'hover-bounce 1s infinite ease-in-out',
				'background-pan': 'background-pan 3s linear infinite',
				'text-gradient-flow': 'text-gradient-flow 3s ease infinite'
			},
			boxShadow: {
				'neon-sm': '0 0 5px rgba(155, 135, 245, 0.5), 0 0 10px rgba(155, 135, 245, 0.3)',
				'neon': '0 0 10px rgba(155, 135, 245, 0.8), 0 0 20px rgba(155, 135, 245, 0.5), 0 0 30px rgba(155, 135, 245, 0.3)',
				'neon-lg': '0 0 15px rgba(155, 135, 245, 1), 0 0 30px rgba(155, 135, 245, 0.7), 0 0 45px rgba(155, 135, 245, 0.5)',
				'neon-orange': '0 0 10px rgba(249, 115, 22, 0.8), 0 0 20px rgba(249, 115, 22, 0.5), 0 0 30px rgba(249, 115, 22, 0.3)',
				'neon-blue': '0 0 10px rgba(14, 165, 233, 0.8), 0 0 20px rgba(14, 165, 233, 0.5), 0 0 30px rgba(14, 165, 233, 0.3)',
				'inner-glow': 'inset 0 0 10px rgba(155, 135, 245, 0.5)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
