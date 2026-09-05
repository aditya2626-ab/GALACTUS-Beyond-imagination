#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#ifdef _WIN32
    #include <windows.h>
#else
    #include <unistd.h>
#endif

/* ANSI Color Codes */
#define RESET "\033[0m"
#define YELLOW "\033[1;33m"
#define CYAN "\033[1;36m"
#define RED "\033[1;31m"

/* 1. Define the Planet struct using typedef for C */
typedef struct {
    double x, y;
    double vx, vy;
    char symbol;
    const char* color;
    const char* name;
} Planet;

/* Cross-platform sleep */
void sleep_ms(int milliseconds) {
#ifdef _WIN32
    Sleep(milliseconds);
#else
    usleep(milliseconds * 1000);
#endif
}

/* Cross-platform cursor reset */
void reset_cursor() {
#ifdef _WIN32
    HANDLE hOut = GetStdHandle(STD_OUTPUT_HANDLE);
    COORD pos = {0, 0};
    SetConsoleCursorPosition(hOut, pos);
#else
    printf("\033[H"); 
#endif
}

int main() {
    const int WIDTH = 70;
    const int HEIGHT = 24;

    const double STAR_X = WIDTH / 2.0;
    const double STAR_Y = HEIGHT / 2.0;
    const double STAR_MASS = 1000.0;
    const double G = 1.0;

    /* 2. Use a standard C Array instead of a C++ Vector */
    int num_planets = 2;
    Planet planets[2] = {
        {STAR_X + 8.0, STAR_Y, 0.0, -11.18, 'O', CYAN, "Planet A"},
        {STAR_X + 11.0, STAR_Y, 0.0, -9.53, 'o', RED,  "Planet B"}
    };

    double time_step = 0.10;

#ifdef _WIN32
    system("cls");
#else
    printf("\033[2J\033[H");
#endif

    for(int frame = 0; frame < 800; frame++) {
        
        /* 3. Physics calculation using standard for-loops */
        for (int i = 0; i < num_planets; i++) {
            double dx = STAR_X - planets[i].x;
            double dy = STAR_Y - planets[i].y;
            double distanceSq = dx*dx + dy*dy;
            double distance = sqrt(distanceSq);

            if (distance > 1.0) { 
                double force = (G * STAR_MASS) / distanceSq;
                double ax = force * (dx / distance);
                double ay = force * (dy / distance);

                planets[i].vx += ax * time_step;
                planets[i].vy += ay * time_step;
                planets[i].x += planets[i].vx * time_step;
                planets[i].y += planets[i].vy * time_step;
            }
        }

        reset_cursor();

        /* 4. Using printf instead of std::cout */
        printf("%s======================================================================\n%s", YELLOW, RESET);
        printf("                 PURE C MULTI-PLANET GRAVITY SIMULATOR                \n");
        printf("%s======================================================================\n%s", YELLOW, RESET);

        for (int y = 0; y < HEIGHT; ++y) {
            printf("%s|%s", YELLOW, RESET);
            for (int x = 0; x < WIDTH; ++x) {
                
                int drawn = 0; // In C, we use ints for booleans (0 = false, 1 = true)
                
                if (x == (int)STAR_X && y == (int)STAR_Y) {
                    printf("%sS%s", YELLOW, RESET);
                    drawn = 1;
                } else {
                    for (int i = 0; i < num_planets; i++) {
                        if (x == (int)planets[i].x && y == (int)planets[i].y) {
                            printf("%s%c%s", planets[i].color, planets[i].symbol, RESET);
                            drawn = 1;
                            break;
                        }
                    }
                }

                if (!drawn) {
                    printf(" "); 
                }
            }
            printf("%s|\n%s", YELLOW, RESET);
        }
        printf("%s======================================================================\n%s", YELLOW, RESET);

        /* 5. Formatting telemetry data using printf specifiers */
        printf("FRAME: %5d | TIMESTEP: %.2fs\n", frame, time_step);
        
        for (int i = 0; i < num_planets; i++) {
            double speed = sqrt(planets[i].vx * planets[i].vx + planets[i].vy * planets[i].vy);
            printf("%s[%s]%s Pos: (%2d, %2d) | Velocity: %.2f km/s  \n", 
                   planets[i].color, planets[i].name, RESET, 
                   (int)planets[i].x, (int)planets[i].y, speed);
        }

        sleep_ms(35); 
    }

    printf("\nSimulation Complete.\n");
    return 0;
}