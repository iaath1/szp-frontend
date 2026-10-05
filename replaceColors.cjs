const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.css') && !fullPath.includes('theme.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            const replacements = [
                { regex: /background(-color)?:\s*(#FFFFFF|white)( *!important)?;/gi, replacement: 'background$1: var(--bg-primary)$3;' },
                { regex: /background(-color)?:\s*(#F9FAFB|#F3F4F6|#F8FAFC)( *!important)?;/gi, replacement: 'background$1: var(--bg-secondary)$3;' },
                { regex: /color:\s*(#111827|#374151)( *!important)?;/gi, replacement: 'color: var(--text-primary)$2;' },
                { regex: /color:\s*(#6B7280|#4B5563|#9CA3AF)( *!important)?;/gi, replacement: 'color: var(--text-secondary)$2;' },
                { regex: /border(-color|-bottom|-top|-left|-right)?:\s*(1px\s+solid\s+)?#E5E7EB( *!important)?;/gi, replacement: 'border$1: $2var(--border-color)$3;' }
            ];

            replacements.forEach(({regex, replacement}) => {
                if (regex.test(content)) {
                    modified = true;
                    // Reset regex state since we called test()
                    regex.lastIndex = 0;
                    content = content.replace(regex, replacement);
                }
            });

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Modified: ' + fullPath);
            }
        }
    });
}

processDir('c:/Users/stogh/Desktop/SZP/szp-frontend/szp-frontend/src');
