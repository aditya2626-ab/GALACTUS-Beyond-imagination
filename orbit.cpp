#include <iostream>
#include <cmath>
#include <vector>
#include <iomanip>

#ifdef _WIN32
    #include <windows.h>
#else
    #include <unistd.h>
#endif

const std::string RESET = "\033[0m";
const std::string YELLOW = "\033[1;33m";
const std::string CYAN = "\033[1;36m";
const std::string RED = "\033[1;31m";

struct Planet {
    double x, y;
    double vx, vy;
    char symbol;
    std::string color;
    std::string name;
};

void sleep_ms(int milliseconds) {
#ifdef _WIN32
    Sleep(milliseconds);
#else
    usleep(milliseconds * 1000);
#endif
}

void reset_cursor() {
#ifdef _WIN32
    HANDLE hOut = GetStdHandle(STD_OUTPUT_HANDLE);
    COORD pos = {0, 0};
    SetConsoleCursorPosition(hOut, pos);
#else
    std::cout << "\033[H"; 
#endif
}

int main() {
    const int WIDTH = 70;
    const int HEIGHT = 24;

    const double STAR_X = WIDTH / 2.0;
    const double STAR_Y = HEIGHT / 2.0;
    const double STAR_MASS = 1000.0;
    const double G = 1.0;

    std::vector<Planet> planets;
    
    // ADJUSTMENT: Radius reduced to 8, Velocity increased to 11.18 to maintain circular orbit
    planets.push_back({STAR_X + 8.0, STAR_Y, 0.0, -11.18, 'O', CYAN, "Planet A"});
    
    // ADJUSTMENT: Radius reduced to 11, Velocity increased to 9.53 to maintain circular orbit
    planets.push_back({STAR_X + 11.0, STAR_Y, 0.0, -9.53, 'o', RED,  "Planet B"});

    double time_step = 0.10; // Slightly smoothed the time step for the faster speeds

#ifdef _WIN32
    system("cls");
#else
    std::cout << "\033[2J\033[H";
#endif

    for(int frame = 0; frame < 800; frame++) {
        
        for (auto& p : planets) {
            double dx = STAR_X - p.x;
            double dy = STAR_Y - p.y;
            double distanceSq = dx*dx + dy*dy;
            double distance = std::sqrt(distanceSq);

            if (distance > 1.0) { 
                double force = (G * STAR_MASS) / distanceSq;
                double ax = force * (dx / distance);
                double ay = force * (dy / distance);

                p.vx += ax * time_step;
                p.vy += ay * time_step;
                p.x += p.vx * time_step;
                p.y += p.vy * time_step;
            }
        }

        reset_cursor();

        std::cout << YELLOW << "======================================================================\n" << RESET;
        std::cout << "                 C++ MULTI-PLANET GRAVITY SIMULATOR                   \n";
        std::cout << YELLOW << "======================================================================\n" << RESET;

        for (int y = 0; y < HEIGHT; ++y) {
            std::cout << YELLOW << "|" << RESET;
            for (int x = 0; x < WIDTH; ++x) {
                
                bool drawn = false;
                
                if (x == (int)STAR_X && y == (int)STAR_Y) {
                    std::cout << YELLOW << "S" << RESET;
                    drawn = true;
                } else {
                    for (const auto& p : planets) {
                        if (x == (int)p.x && y == (int)p.y) {
                            std::cout << p.color << p.symbol << RESET;
                            drawn = true;
                            break;
                        }
                    }
                }

                if (!drawn) {
                    std::cout << " "; 
                }
            }
            std::cout << YELLOW << "|\n" << RESET;
        }
        std::cout << YELLOW << "======================================================================\n" << RESET;

        std::cout << "FRAME: " << std::setw(5) << frame << " | TIMESTEP: " << time_step << "s\n";
        for (const auto& p : planets) {
            double speed = std::sqrt(p.vx*p.vx + p.vy*p.vy);
            std::cout << p.color << "[" << p.name << "] " << RESET 
                      << "Pos: (" << std::setw(2) << (int)p.x << ", " << std::setw(2) << (int)p.y << ") | "
                      << "Velocity: " << std::fixed << std::setprecision(2) << speed << " km/s  \n";
        }

        sleep_ms(20); 
    }

    std::cout << "\nSimulation Complete.\n";
    return 0;
}
