import pygame
import random
import math
from PIL import Image, ImageDraw, ImageFont

# Initialize Pygame and its mixer
pygame.init()
pygame.mixer.init()

# Set up display
WIDTH, HEIGHT = 1920, 1080
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("The Drink Don't Need No Mix - Lyric Video")

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
NEON_COLORS = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0), (255, 0, 255), (0, 255, 255)]

# Fonts
pygame.font.init()
font = pygame.font.Font(None, 36)
timer_font = pygame.font.Font(None, 24)

# Lyrics with timestamps (in seconds)
lyrics = [
    (1, "Got so drunk, he hit his head on the sidewalk, but he good, he gon' be alright"),
    (5, "We just left Whiskey Road thirty minutes ago and he still seein' neon lights"),
    (9, "Drive up to the dive bar, get PBR, that's just how we start our nights"),
    (13, "I see them bachelorettes on Broadway and they all wanna be my wife")
]

# Load the audio file
pygame.mixer.music.load('DrinkDontNeedNoMix.mp3')

# Total video duration (in seconds)
TOTAL_DURATION = 30  # Adjust this to match your actual audio duration

# Skyline
skyline = pygame.Surface((WIDTH * 2, HEIGHT // 2))
skyline.fill(BLACK)
for _ in range(50):
    x = random.randint(0, WIDTH * 2)
    y = random.randint(HEIGHT // 4, HEIGHT // 2)
    w = random.randint(20, 100)
    h = random.randint(50, max(51, HEIGHT // 2 - y))  # Ensure minimum height of 1
    pygame.draw.rect(skyline, (50, 50, 50), (x, y, w, h))

# Particle system
particles = []

def create_neon_text(text, window_width, window_height):
    pygame.font.init()
    max_font_size = 74  # Starting font size
    font_size = max_font_size
    font = pygame.font.Font(None, font_size)
    
    # Adjust font size to fit within the window width
    while font.size(text)[0] > window_width and font_size > 1:
        font_size -= 1
        font = pygame.font.Font(None, font_size)
    
    text_width, text_height = font.size(text)
    
    # Create a surface for the text
    text_surface = pygame.Surface((text_width, text_height), pygame.SRCALPHA)
    text_surface.fill((0, 0, 0, 0))  # Make the surface transparent

    # Render the text
    text_render = font.render(text, True, (255, 0, 0))  # Adjust the color as needed
    text_surface.blit(text_render, (0, 0))

    return text_surface

def draw_sidewalk(screen):
    pygame.draw.rect(screen, (100, 100, 100), (0, HEIGHT - 100, WIDTH, 100))
    for i in range(0, WIDTH, 50):
        pygame.draw.line(screen, (150, 150, 150), (i, HEIGHT - 100), (i + 25, HEIGHT), 2)

def draw_neon_lights(screen):
    for _ in range(20):
        x = random.randint(0, WIDTH)
        y = random.randint(0, HEIGHT // 2)
        color = random.choice(NEON_COLORS)
        pygame.draw.circle(screen, color, (x, y), random.randint(2, 5))

def draw_timers(screen, current_time, next_lyric_time, total_duration):
    elapsed_time = f"Elapsed Time: {current_time:.2f}s"
    time_to_next = f"Time to Next Lyric: {max(0, next_lyric_time - current_time):.2f}s"
    time_remaining = f"Time Remaining: {max(0, total_duration - current_time):.2f}s"

    elapsed_text = timer_font.render(elapsed_time, True, WHITE)
    next_text = timer_font.render(time_to_next, True, WHITE)
    remaining_text = timer_font.render(time_remaining, True, WHITE)

    screen.blit(elapsed_text, (10, 10))
    screen.blit(next_text, (10, 40))
    screen.blit(remaining_text, (10, 70))

def draw_pulsating_background(screen, current_time):
    color = int(128 + 127 * math.sin(current_time * 2))
    screen.fill((color // 8, color // 8, color // 4))

def draw_scrolling_skyline(screen, current_time):
    x = int(current_time * 50) % WIDTH
    screen.blit(skyline, (-x, 0))
    screen.blit(skyline, (WIDTH - x, 0))

def draw_bachelorettes(screen, current_time):
    for i in range(5):
        x = (i * 200 + int(current_time * 100)) % WIDTH
        y = HEIGHT - 150
        color = NEON_COLORS[i % len(NEON_COLORS)]
        pygame.draw.line(screen, color, (x, y), (x, y - 50), 3)
        pygame.draw.circle(screen, color, (x, y - 60), 10)
        pygame.draw.line(screen, color, (x, y - 30), (x - 20, y + 20), 3)
        pygame.draw.line(screen, color, (x, y - 30), (x + 20, y + 20), 3)

def create_particle(x, y):
    return {
        'x': x,
        'y': y,
        'dx': random.uniform(-2, 2),
        'dy': random.uniform(-2, 2),
        'lifetime': random.uniform(0.5, 2),
        'color': random.choice(NEON_COLORS)
    }

def update_particles(particles, dt):
    for particle in particles[:]:
        particle['x'] += particle['dx']
        particle['y'] += particle['dy']
        particle['lifetime'] -= dt
        if particle['lifetime'] <= 0:
            particles.remove(particle)

def draw_particles(screen, particles):
    for particle in particles:
        pygame.draw.circle(screen, particle['color'], (int(particle['x']), int(particle['y'])), 2)

def main():
    clock = pygame.time.Clock()
    pygame.mixer.music.play()
    start_time = pygame.time.get_ticks()
    current_lyric_index = 0

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        current_time = (pygame.time.get_ticks() - start_time) / 1000

        draw_pulsating_background(screen, current_time)
        draw_scrolling_skyline(screen, current_time)
        draw_sidewalk(screen)
        draw_neon_lights(screen)
        draw_bachelorettes(screen, current_time)

        if random.random() < 0.1:
            particles.append(create_particle(random.randint(0, WIDTH), random.randint(0, HEIGHT)))

        update_particles(particles, 1/60)
        draw_particles(screen, particles)

        if current_lyric_index < len(lyrics):
            lyric_time, lyric_text = lyrics[current_lyric_index]
            if current_time >= lyric_time:
                neon_text = create_neon_text(lyric_text, WIDTH, HEIGHT)
                text_pos = (WIDTH // 2 - neon_text.get_width() // 2, 
                            HEIGHT // 2 - neon_text.get_height() // 2 + math.sin(current_time * 10) * 10)
                screen.blit(neon_text, text_pos)
               
                if current_lyric_index + 1 < len(lyrics) and current_time >= lyrics[current_lyric_index + 1][0]:
                    current_lyric_index += 1

        next_lyric_time = TOTAL_DURATION
        if current_lyric_index < len(lyrics) - 1:
            next_lyric_time = lyrics[current_lyric_index + 1][0]

        draw_timers(screen, current_time, next_lyric_time, TOTAL_DURATION)

        pygame.display.flip()
        clock.tick(60)

        if current_time >= TOTAL_DURATION or not pygame.mixer.music.get_busy():
            running = False

    pygame.mixer.music.stop()
    pygame.quit()

if __name__ == "__main__":
    main()