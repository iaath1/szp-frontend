import React from 'react';
import styles from './TagBadge.module.css';
import { X } from 'lucide-react';

const TagBadge = ({ tag, onDelete }) => {
    // Determine text color based on background luminance for better readability
    const getContrastYIQ = (hexcolor) => {
        if (!hexcolor) return 'white';
        // Remove hash if exists
        hexcolor = hexcolor.replace("#", "");
        
        // Handle 3-char hex
        if (hexcolor.length === 3) {
            hexcolor = hexcolor.split('').map(char => char + char).join('');
        }
        
        const r = parseInt(hexcolor.substr(0,2),16);
        const g = parseInt(hexcolor.substr(2,2),16);
        const b = parseInt(hexcolor.substr(4,2),16);
        const yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 128) ? 'black' : 'white';
    };

    const textColor = getContrastYIQ(tag.colorHex);

    return (
        <span 
            className={styles.badge} 
            style={{ 
                backgroundColor: tag.colorHex || '#ccc',
                color: textColor
            }}
        >
            {tag.name}
            {onDelete && (
                <button 
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => onDelete(tag.id)}
                    style={{ color: textColor }}
                    aria-label={`Delete tag ${tag.name}`}
                >
                    <X size={12} strokeWidth={3} />
                </button>
            )}
        </span>
    );
};

export default TagBadge;
