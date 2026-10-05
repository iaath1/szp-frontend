const PlaceholderTab = ({ tabName }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            color: '#6B7280'
        }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '18px' }}>{tabName}</h3>
            <p style={{ margin: 0 }}>This tab is under construction.</p>
        </div>
    );
};

export default PlaceholderTab;
