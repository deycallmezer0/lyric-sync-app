import pygame
import random
import math
from pygame import gfxdraw
from mutagen.mp3 import MP3
import colorsys
import os 
# Initialize Pygame and its mixer
pygame.init()
pygame.mixer.init()

# Constants
WIDTH, HEIGHT = 1280, 720
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GOLD = (255, 215, 0)
IMAGE_CONTAINER_WIDTH = 200
IMAGE_CONTAINER_HEIGHT = 200
LYRIC_FONT_SIZE = 48
AGGRESSIVE_TEXT_SIZE = 74
TIMER_FONT_SIZE = 24
DEFAULT_IMAGE_PATH = 'boxing_glove.png'  # Path to default image

# Setup display and fonts
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Enhanced Taylor Made Freestyle - Drake Lyric Video")
font = pygame.font.Font(None, 36)
lyric_font = pygame.font.Font(None, LYRIC_FONT_SIZE)
timer_font = pygame.font.Font(None, TIMER_FONT_SIZE)

# Lyrics
lyrics = [
    "Ay, Kendrick just opened his mouth",
    "Someone go hand him a Grammy right now",
    "Where is your uncle at?",
    "'Cause I wanna talk to the man of the house",
    "West Coast niggas do fades, right?",
    "Come get this ass whoopin', I'm handin' 'em out",
    "You wanna take up for Pharrell?",
    "Then come get his legacy out of my house"
]

# Load audio
audio_file = 'FamilyMatters.mp3'
pygame.mixer.music.load(audio_file)
audio = MP3(audio_file)
TOTAL_DURATION = audio.info.length

# Update the image_files list to include 'kendrick_silhouette.png'
image_files = ['megaphone.png', 'megaphone.png', 'megaphone.png', 'megaphone.png', 'megaphone.png',
               'megaphone.png', 'megaphone.png', 'megaphone.png', 'megaphone.png', 'megaphone.png', 'megaphone.png']
images = {}

# Update the load_image function
def load_image(image_path):
    try:
        image = pygame.image.load(image_path)
    except (pygame.error, FileNotFoundError): 
        print(f"File '{image_path}' not found. Creating a placeholder image.")
        image = pygame.Surface((IMAGE_CONTAINER_WIDTH, IMAGE_CONTAINER_HEIGHT))
        image.fill((128, 128, 128))  # Fill with gray color
        font = pygame.font.Font(None, 24)
        text = font.render("Placeholder", True, (255, 255, 255))
        image.blit(text, (10, IMAGE_CONTAINER_HEIGHT // 2 - 12))
    return pygame.transform.scale(image, (IMAGE_CONTAINER_WIDTH, IMAGE_CONTAINER_HEIGHT))

# Update the load_images function
def load_images():
    for file in image_files:
        name = file.split('.')[0]
        if os.path.exists(file):
            images[name] = load_image(file)
        else:
            print(f"File '{file}' not found. Creating a placeholder image.")
            placeholder = pygame.Surface((IMAGE_CONTAINER_WIDTH, IMAGE_CONTAINER_HEIGHT))
            placeholder.fill((128, 128, 128))  # Fill with gray color
            font = pygame.font.Font(None, 24)
            text = font.render(name, True, (255, 255, 255))
            placeholder.blit(text, (10, IMAGE_CONTAINER_HEIGHT // 2 - 12))
            images[name] = placeholder

# Update the create_particle function
def create_particle(x, y):
    return {
        'x': x,
        'y': y,
        'x_vel': random.uniform(-1, 1),
        'y_vel': random.uniform(-1, 1),
        'size': random.randint(1, 4),
        'color': random.choice([RED, GOLD, WHITE]),
        'life': 255
    }

# Update the draw_particles function
def draw_particles(surface):
    for particle in particles:
        particle['x'] += particle['x_vel']
        particle['y'] += particle['y_vel']
        particle['size'] -= 0.05
        particle['life'] -= 2
        if particle['life'] > 0:
            color = particle['color'] + (particle['life'],)
            pygame.draw.circle(surface, color, (int(particle['x']), int(particle['y'])), int(particle['size']))

def create_aggressive_text(text):
    font = pygame.font.Font(None, AGGRESSIVE_TEXT_SIZE)
    return font.render(text, True, RED)

def draw_shaking_text(surface, text, pos, shake_amount):
    x, y = pos
    x += random.randint(-shake_amount, shake_amount)
    y += random.randint(-shake_amount, shake_amount)
    surface.blit(text, (x, y))

def draw_cracking_screen(surface, intensity):
    for _ in range(intensity):
        x1, y1 = random.randint(0, WIDTH), random.randint(0, HEIGHT)
        x2, y2 = x1 + random.randint(-100, 100), y1 + random.randint(-100, 100)
        pygame.draw.line(surface, WHITE, (x1, y1), (x2, y2), 2)

def draw_pulsating_silhouette(surface, image):
    t = pygame.time.get_ticks() / 1000
    size = int(200 + math.sin(t * 5) * 20)
    resized_image = pygame.transform.scale(image, (size, size))
    surface.blit(resized_image, (WIDTH // 2 - size // 2, HEIGHT // 2 - size // 2))

def draw_flying_grammy(surface, progress):
    x = int(WIDTH * progress)
    y = HEIGHT // 2 + int(math.sin(progress * 10) * 50)
    rotated_grammy = pygame.transform.rotate(images['grammy'], progress * 360)
    surface.blit(rotated_grammy, (x - rotated_grammy.get_width() // 2, y - rotated_grammy.get_height() // 2))

def draw_boxing_gloves(surface, intensity):
    for _ in range(intensity):
        x = random.randint(0, WIDTH)
        y = random.randint(0, HEIGHT)
        angle = random.uniform(0, 360)
        rotated_glove = pygame.transform.rotate(images['boxing_glove'], angle)
        surface.blit(rotated_glove, (x, y))

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

def mark_lyrics():
    clock = pygame.time.Clock()
    pygame.mixer.music.play()
    start_time = pygame.time.get_ticks()
    marked_lyrics = []
    remaining_lyrics = lyrics.copy()

    running = True
    while running and remaining_lyrics:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    current_time = (pygame.time.get_ticks() - start_time) / 1000
                    marked_lyrics.append((current_time, remaining_lyrics.pop(0)))

        screen.fill(BLACK)
        
        # Display remaining lyrics
        for i, lyric in enumerate(remaining_lyrics):
            text = font.render(lyric, True, WHITE)
            screen.blit(text, (50, 100 + i * 40))

        # Display current time
        current_time = (pygame.time.get_ticks() - start_time) / 1000
        time_text = font.render(f"Current Time: {current_time:.2f}s", True, WHITE)
        screen.blit(time_text, (50, 50))

        pygame.display.flip()
        clock.tick(60)

    pygame.mixer.music.stop()
    return marked_lyrics

def draw_visual_elements(screen, current_lyric_index, marked_lyrics, current_time):
    lyric_time, lyric_text = marked_lyrics[current_lyric_index]
    aggressive_text = create_aggressive_text(lyric_text)
    text_x = WIDTH // 2 - aggressive_text.get_width() // 2
    text_y = HEIGHT // 2 - aggressive_text.get_height() // 2
    
    # Calculate the progress of the current lyric
    progress = (current_time - lyric_time) / 4  # Assuming each lyric lasts about 4 seconds
    
    # Apply a zoom-in effect to the text
    zoom_factor = 1 + math.sin(progress * math.pi) * 0.2
    zoomed_text = pygame.transform.scale(aggressive_text, 
                                         (int(aggressive_text.get_width() * zoom_factor),
                                          int(aggressive_text.get_height() * zoom_factor)))
    
    # Apply a color cycling effect
    hue = (current_time * 0.1) % 1.0
    color = [int(c * 255) for c in colorsys.hsv_to_rgb(hue, 1.0, 1.0)]
    color_surface = pygame.Surface(zoomed_text.get_size(), pygame.SRCALPHA)
    color_surface.fill(color + [128])  # Semi-transparent color overlay
    zoomed_text.blit(color_surface, (0, 0), special_flags=pygame.BLEND_RGBA_MULT)
    
    draw_shaking_text(screen, zoomed_text, (text_x, text_y), 5)

    # Draw image directly under the text within a container
    image_y = text_y + zoomed_text.get_height() + 10  # 10 pixels below the text
    if "mouth" in lyric_text.lower():
        if "kendrick" in lyric_text.lower():
            draw_pulsating_silhouette(screen, images['kendrick_silhouette'])
        else:
            image_x = WIDTH // 2 - images['megaphone'].get_width() // 2
            rotated_megaphone = pygame.transform.rotate(images['megaphone'], math.sin(current_time * 5) * 15)
            screen.blit(rotated_megaphone, (image_x, image_y))
    elif "grammy" in lyric_text.lower():
        draw_flying_grammy(screen, progress)
    elif "uncle" in lyric_text.lower():
        image_x = WIDTH // 2 - images['search_light'].get_width() // 2
        scaled_searchlight = pygame.transform.scale(images['search_light'], 
                                                    (int(IMAGE_CONTAINER_WIDTH * (1 + math.sin(current_time * 3) * 0.2)),
                                                     int(IMAGE_CONTAINER_HEIGHT * (1 + math.sin(current_time * 3) * 0.2))))
        screen.blit(scaled_searchlight, (image_x, image_y))
    elif "man of the house" in lyric_text.lower():
        image_x = WIDTH // 2 - images['house'].get_width() // 2
        house_shake = math.sin(current_time * 10) * 5
        screen.blit(images['house'], (image_x + house_shake, image_y))
    elif "fades" in lyric_text.lower():
        image_x = WIDTH // 2 - images['clippers'].get_width() // 2
        rotated_clippers = pygame.transform.rotate(images['clippers'], current_time * 180)
        screen.blit(rotated_clippers, (image_x, image_y))
    elif "ass whoopin'" in lyric_text.lower():
        draw_boxing_gloves(screen, 5)
    elif "pharrell" in lyric_text.lower():
        image_x = WIDTH // 2 - images['pharrell_hat'].get_width() // 2
        hat_bounce = math.sin(current_time * 5) * 20
        screen.blit(images['pharrell_hat'], (image_x, image_y + hat_bounce))
    elif "legacy" in lyric_text.lower():
        image_x = WIDTH // 2 - images['ovo_owl'].get_width() // 2
        owl_scale = 1 + math.sin(current_time * 2) * 0.1
        scaled_owl = pygame.transform.scale(images['ovo_owl'], 
                                            (int(IMAGE_CONTAINER_WIDTH * owl_scale),
                                             int(IMAGE_CONTAINER_HEIGHT * owl_scale)))
        screen.blit(scaled_owl, (image_x, image_y))

def transition_effect(screen, progress):
    radius = int((1 - progress) * math.sqrt(WIDTH**2 + HEIGHT**2))
    pygame.draw.circle(screen, BLACK, (WIDTH // 2, HEIGHT // 2), radius)

def main():
    global particles  # Make particles global so we can modify it
    marked_lyrics = mark_lyrics()
    particles = []  # Initialize particles list

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
        screen.fill(BLACK)

        if current_lyric_index < len(marked_lyrics):
            lyric_time, lyric_text = marked_lyrics[current_lyric_index]
            if current_time >= lyric_time:
                draw_visual_elements(screen, current_lyric_index, marked_lyrics, current_time)
                
                # Transition effect
                if current_lyric_index + 1 < len(marked_lyrics):
                    next_lyric_time = marked_lyrics[current_lyric_index + 1][0]
                    transition_progress = (current_time - lyric_time) / (next_lyric_time - lyric_time)
                    if transition_progress > 0.8:  # Start transition at 80% of lyric duration
                        transition_effect(screen, (transition_progress - 0.8) * 5)  # Scale to 0-1 range
                
                if current_lyric_index + 1 < len(marked_lyrics) and current_time >= marked_lyrics[current_lyric_index + 1][0]:
                    current_lyric_index += 1

        draw_cracking_screen(screen, 10)
        
        for _ in range(5):
            particles.append(create_particle(random.randint(0, WIDTH), random.randint(0, HEIGHT)))
        draw_particles(screen)
        particles[:] = [p for p in particles if p['life'] > 0]

        next_lyric_time = TOTAL_DURATION
        if current_lyric_index < len(marked_lyrics) - 1:
            next_lyric_time = marked_lyrics[current_lyric_index + 1][0]

        draw_timers(screen, current_time, next_lyric_time, TOTAL_DURATION)

        # Add a background effect
        draw_background_effect(screen, current_time)

        pygame.display.flip()
        clock.tick(60)

        if current_time >= TOTAL_DURATION or not pygame.mixer.music.get_busy():
            running = False

    pygame.mixer.music.stop()
    pygame.quit()



def draw_background_effect(screen, current_time):
    # Create a dynamic background effect
    for i in range(0, WIDTH, 40):
        for j in range(0, HEIGHT, 40):
            color = [(math.sin(current_time + i * 0.01) + 1) / 2 * 255,
                     (math.cos(current_time + j * 0.01) + 1) / 2 * 255,
                     (math.sin(current_time * 0.5) + 1) / 2 * 255]
            pygame.draw.rect(screen, color, (i, j, 40, 40), 1)

def create_lyric_transition(old_text, new_text, progress):
    font = pygame.font.Font(None, AGGRESSIVE_TEXT_SIZE)
    old_surface = font.render(old_text, True, RED)
    new_surface = font.render(new_text, True, RED)
    
    transition_surface = pygame.Surface((max(old_surface.get_width(), new_surface.get_width()),
                                         old_surface.get_height()), pygame.SRCALPHA)
    
    for i in range(len(old_text)):
        char_progress = max(0, min(1, (progress - i/len(old_text)) * len(old_text)))
        if char_progress < 1:
            char_surface = font.render(old_text[i], True, RED)
            transition_surface.blit(char_surface, (i * AGGRESSIVE_TEXT_SIZE // 2, int(char_progress * old_surface.get_height())))
    
    for i in range(len(new_text)):
        char_progress = max(0, min(1, (progress - i/len(new_text)) * len(new_text)))
        if char_progress > 0:
            char_surface = font.render(new_text[i], True, RED)
            transition_surface.blit(char_surface, (i * AGGRESSIVE_TEXT_SIZE // 2, int((1-char_progress) * old_surface.get_height())))
    
    return transition_surface

def draw_visual_elements(screen, current_lyric_index, marked_lyrics, current_time):
    lyric_time, lyric_text = marked_lyrics[current_lyric_index]
    
    # Calculate the progress of the current lyric
    progress = (current_time - lyric_time) / 4  # Assuming each lyric lasts about 4 seconds
    
    # Create transitioning text
    if current_lyric_index > 0:
        prev_lyric_text = marked_lyrics[current_lyric_index - 1][1]
        transitioning_text = create_lyric_transition(prev_lyric_text, lyric_text, progress)
    else:
        transitioning_text = create_aggressive_text(lyric_text)
    
    text_x = WIDTH // 2 - transitioning_text.get_width() // 2
    text_y = HEIGHT // 2 - transitioning_text.get_height() // 2
    
    # Apply a zoom-in effect to the text
    zoom_factor = 1 + math.sin(progress * math.pi) * 0.2
    zoomed_text = pygame.transform.scale(transitioning_text, 
                                         (int(transitioning_text.get_width() * zoom_factor),
                                          int(transitioning_text.get_height() * zoom_factor)))
    
    # Apply a color cycling effect
    hue = (current_time * 0.1) % 1.0
    color = [int(c * 255) for c in colorsys.hsv_to_rgb(hue, 1.0, 1.0)]
    color_surface = pygame.Surface(zoomed_text.get_size(), pygame.SRCALPHA)
    color_surface.fill(color + [128])  # Semi-transparent color overlay
    zoomed_text.blit(color_surface, (0, 0), special_flags=pygame.BLEND_RGBA_MULT)
    
    draw_shaking_text(screen, zoomed_text, (text_x, text_y), 5)

    # Draw image directly under the text within a container
    image_y = text_y + zoomed_text.get_height() + 10  # 10 pixels below the text
    if "mouth" in lyric_text.lower():
        if "kendrick" in lyric_text.lower():
            draw_pulsating_silhouette(screen, images['megaphone'])
        else:
            image_x = WIDTH // 2 - images['megaphone'].get_width() // 2
            rotated_megaphone = pygame.transform.rotate(images['megaphone'], math.sin(current_time * 5) * 15)
            screen.blit(rotated_megaphone, (image_x, image_y))
    elif "grammy" in lyric_text.lower():
        draw_flying_grammy(screen, progress)
    elif "uncle" in lyric_text.lower():
        image_x = WIDTH // 2 - images['megaphone'].get_width() // 2
        scaled_searchlight = pygame.transform.scale(images['megaphone'], 
                                                    (int(IMAGE_CONTAINER_WIDTH * (1 + math.sin(current_time * 3) * 0.2)),
                                                     int(IMAGE_CONTAINER_HEIGHT * (1 + math.sin(current_time * 3) * 0.2))))
        screen.blit(scaled_searchlight, (image_x, image_y))
    elif "man of the house" in lyric_text.lower():
        image_x = WIDTH // 2 - images['megaphone'].get_width() // 2
        house_shake = math.sin(current_time * 10) * 5
        screen.blit(images['megaphone'], (image_x + house_shake, image_y))
    elif "fades" in lyric_text.lower():
        image_x = WIDTH // 2 - images['megaphone'].get_width() // 2
        rotated_clippers = pygame.transform.rotate(images['megaphone'], current_time * 180)
        screen.blit(rotated_clippers, (image_x, image_y))
    elif "ass whoopin'" in lyric_text.lower():
        draw_boxing_gloves(screen, 5)
    elif "pharrell" in lyric_text.lower():
        image_x = WIDTH // 2 - images['megaphone'].get_width() // 2
        hat_bounce = math.sin(current_time * 5) * 20
        screen.blit(images['megaphone'], (image_x, image_y + hat_bounce))
    elif "legacy" in lyric_text.lower():
        image_x = WIDTH // 2 - images['megaphone'].get_width() // 2
        owl_scale = 1 + math.sin(current_time * 2) * 0.1
        scaled_owl = pygame.transform.scale(images['megaphone'], 
                                            (int(IMAGE_CONTAINER_WIDTH * owl_scale),
                                             int(IMAGE_CONTAINER_HEIGHT * owl_scale)))
        screen.blit(scaled_owl, (image_x, image_y))

    # Add a starburst effect
    draw_starburst(screen, (WIDTH // 2, HEIGHT // 2), current_time)

def draw_starburst(screen, center, current_time):
    num_lines = 12
    max_length = 100
    for i in range(num_lines):
        angle = i * (2 * math.pi / num_lines) + current_time
        length = abs(math.sin(current_time * 5)) * max_length
        end_pos = (center[0] + math.cos(angle) * length, center[1] + math.sin(angle) * length)
        pygame.draw.line(screen, GOLD, center, end_pos, 2)

def transition_effect(screen, progress):
    if progress < 0.5:
        # Zoom out effect
        scale = 1 + progress * 2
        scaled_screen = pygame.transform.scale(screen, (int(WIDTH * scale), int(HEIGHT * scale)))
        screen.blit(scaled_screen, (-int(WIDTH * (scale - 1) / 2), -int(HEIGHT * (scale - 1) / 2)))
    else:
        # Fade to black effect
        overlay = pygame.Surface((WIDTH, HEIGHT))
        overlay.fill(BLACK)
        overlay.set_alpha(int(255 * (progress - 0.5) * 2))
        screen.blit(overlay, (0, 0))

if __name__ == "__main__":
    main()