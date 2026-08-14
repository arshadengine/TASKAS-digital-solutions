import math
from PIL import Image, ImageDraw

def bezier_point(p0, p1, p2, p3, t):
    # Cubic bezier formula
    x = (1-t)**3 * p0[0] + 3*(1-t)**2 * t * p1[0] + 3*(1-t) * t**2 * p2[0] + t**3 * p3[0]
    y = (1-t)**3 * p0[1] + 3*(1-t)**2 * t * p1[1] + 3*(1-t) * t**2 * p2[1] + t**3 * p3[1]
    return (x, y)

def interpolate_color(c1, c2, factor):
    r = int(c1[0] + (c2[0] - c1[0]) * factor)
    g = int(c1[1] + (c2[1] - c1[1]) * factor)
    b = int(c1[2] + (c2[2] - c1[2]) * factor)
    a = int(c1[3] + (c2[3] - c1[3]) * factor) if len(c1) > 3 and len(c2) > 3 else 255
    return (r, g, b, a)

def draw_diagonal_gradient_polygon(draw, points, c1, c2, g_start, g_end):
    # Draw a polygon with a diagonal linear gradient
    vx = g_end[0] - g_start[0]
    vy = g_end[1] - g_start[1]
    v_len_sq = vx*vx + vy*vy
    if v_len_sq == 0:
        v_len_sq = 1
    
    # Calculate bounding box of the polygon
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    
    # Create a mask for the polygon
    img_size = draw.im.size
    mask = Image.new("L", img_size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.polygon(points, fill=255)
    
    # Create the gradient image
    grad_img = Image.new("RGBA", img_size)
    grad_draw = ImageDraw.Draw(grad_img)
    
    for y in range(max(0, int(min_y)), min(img_size[1], int(max_y) + 1)):
        for x in range(max(0, int(min_x)), min(img_size[0], int(max_x) + 1)):
            # Project point (x, y) onto the gradient line
            dx = x - g_start[0]
            dy = y - g_start[1]
            projection = (dx * vx + dy * vy) / v_len_sq
            factor = max(0.0, min(1.0, projection))
            color = interpolate_color(c1, c2, factor)
            grad_draw.point((x, y), fill=color)
            
    return grad_img, mask

def build_favicon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    scale = size / 100.0
    
    # Path 1 (Blue Wing Checkmark)
    p1_nodes = []
    current = (22 * scale, 28 * scale)
    p1_nodes.append(current)
    
    def add_bezier(p0, p1, p2, p3):
        for step in range(1, 21):
            t = step / 20.0
            pt = bezier_point(p0, p1, p2, p3, t)
            p1_nodes.append(pt)
            
    add_bezier(current, (22*scale, 28*scale), (20*scale, 48*scale), (34*scale, 68*scale))
    current = (34*scale, 68*scale)
    
    add_bezier(current, (42*scale, 78*scale), (49*scale, 82*scale), (54*scale, 82*scale))
    current = (54*scale, 82*scale)
    
    add_bezier(current, (59*scale, 82*scale), (63*scale, 76*scale), (65*scale, 71*scale))
    current = (65*scale, 71*scale)
    
    add_bezier(current, (67*scale, 67*scale), (65*scale, 62*scale), (60*scale, 62*scale))
    current = (60*scale, 62*scale)
    
    current = (52*scale, 62*scale)
    p1_nodes.append(current)
    
    add_bezier(current, (43*scale, 62*scale), (36*scale, 53*scale), (33*scale, 43*scale))
    current = (33*scale, 43*scale)
    
    current = (30*scale, 28*scale)
    p1_nodes.append(current)
    
    add_bezier(current, (29*scale, 25*scale), (23*scale, 25*scale), (22*scale, 28*scale))
    
    # Path 2 (Orange straight wing)
    p2_points = [
        (43.5 * scale, 68 * scale),
        (55.5 * scale, 80 * scale),
        (88 * scale, 28 * scale),
        (70 * scale, 28 * scale)
    ]
    
    # Colors
    c_blue1 = (74, 95, 120, 255)    # #4a5f78
    c_blue2 = (31, 45, 61, 255)     # #1f2d3d
    c_orange1 = (230, 126, 34, 255)  # #e67e22
    c_orange2 = (243, 156, 18, 255)  # #f39c12
    
    final_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    
    # Render blue
    blue_grad_img, blue_mask = draw_diagonal_gradient_polygon(
        ImageDraw.Draw(final_img), p1_nodes, c_blue1, c_blue2,
        (20*scale, 20*scale), (80*scale, 80*scale)
    )
    final_img.paste(blue_grad_img, (0,0), mask=blue_mask)
    
    # Render orange
    orange_grad_img, orange_mask = draw_diagonal_gradient_polygon(
        ImageDraw.Draw(final_img), p2_points, c_orange1, c_orange2,
        (50*scale, 70*scale), (80*scale, 30*scale)
    )
    final_img.paste(orange_grad_img, (0,0), mask=orange_mask)
    
    return final_img

# Generate the files
print("Generating TASKAS favicon assets...")

# 1. Generate 512x512 master favicon.png
fav_512 = build_favicon(512)
fav_512.save("favicon.png")
fav_512.save("images/favicon.png")

# 2. Generate 180x180 apple-touch-icon.png
fav_180 = build_favicon(180)
fav_180.save("apple-touch-icon.png")

# 3. Generate 32x32 and 16x16 PNGs
fav_32 = build_favicon(32)
fav_32.save("favicon-32x32.png")

fav_16 = build_favicon(16)
fav_16.save("favicon-16x16.png")

# 4. Generate multi-size favicon.ico
fav_48 = build_favicon(48)
fav_32_ico = build_favicon(32)
fav_16_ico = build_favicon(16)

fav_32_ico.save(
    "favicon.ico", 
    format="ICO", 
    sizes=[(16, 16), (32, 32), (48, 48)], 
    append_images=[fav_16_ico, fav_48]
)

print("Favicon assets generated successfully!")
