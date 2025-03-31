import { floor } from "./nbr";
import { pad } from "./str";

/**
 * Formate le temps selon ces règles :
 * - Si heures > 0 : "5h30"
 * - Si minutes > 0 : "05:30"
 * - Si secondes seules : "05.234" (avec millisecondes)
 * @param ms Temps en millisecondes
 */
export const formatMs = (ms: number): string => {
    if (ms === 0) return "00.000";
    
    // Conversion en composants de temps
    const totalSeconds = floor(Math.abs(ms) / 1000);
    const hours = floor(totalSeconds / 3600);
    const minutes = floor((totalSeconds % 3600) / 60);
    const seconds = floor(totalSeconds % 60);

    // Le signe ne sera appliqué qu'au début si négatif
    const sign = ms < 0 ? '-' : '';
    
    if (hours > 0) {
        return `${sign}${hours}h${pad(minutes, 2)}`;
    }
    
    if (minutes > 0) {
        return `${sign}${pad(minutes, 2)}:${pad(seconds, 2)} min`;
    }
    
    return `${sign}${seconds} sec`;
};