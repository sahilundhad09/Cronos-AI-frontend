import { useEffect, useState } from 'react';
import { Droppable, DroppableProps } from 'react-beautiful-dnd';

/**
 * react-beautiful-dnd is incompatible with React 18 Strict Mode out of the box
 * because Strict Mode double-invokes effects and corrupts drag state.
 *
 * This wrapper delays rendering until after the first mount cycle,
 * allowing react-beautiful-dnd to initialize correctly even in Strict Mode.
 *
 * @see https://github.com/atlassian/react-beautiful-dnd/issues/2350
 */
const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));
        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        };
    }, []);

    if (!enabled) return null;

    return <Droppable {...props}>{children}</Droppable>;
};

export default StrictModeDroppable;
