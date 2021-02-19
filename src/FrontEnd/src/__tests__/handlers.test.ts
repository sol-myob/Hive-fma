import { handleDragOver, handleDrop, handleKeyboardNav } from '../handlers';

describe(`handler tests`, () => {
    describe(`handle drag over tests`, () => {
        test('should prevent default on dragover', () => {
            const preventDefault = jest.fn();
            handleDragOver({ preventDefault });
            expect(preventDefault).toBeCalled();
        });
    });

    describe(`handle drop tests`, () => {
        test('should prevent default ondrop', () => {
            const preventDefault = jest.fn();
            handleDrop({ preventDefault });
            expect(preventDefault).toBeCalled();
        });
    });

    describe(`handleKeyboardNav tests`, () => {
        let div1: HTMLDivElement, div2: HTMLDivElement, div3: HTMLDivElement, div4: HTMLDivElement;
        beforeEach(() => {
            const container = document.createElement('div', {});
            container.innerHTML = '<div tabIndex=\'1\'/><div tabIndex=\'1\'/><div tabIndex=\'1\'/><div tabIndex=\'1\' class=\'name\'/>';
            document.body.append(container);
            const elements = container.getElementsByTagName('div');
            [div1, div2, div3, div4] = Array.from(elements);
        });

        test('should move to next element on keydown', () => {
            expect(handleKeyboardNav({ key: 'ArrowDown', target: div1 })).toBe(true);
            expect(div2).toHaveFocus();
            expect(div4).not.toHaveFocus();
        });

        test('should move to next element on key right', () => {
            expect(handleKeyboardNav({ key: 'ArrowRight', target: div1 })).toBe(true);
            expect(div2).toHaveFocus();
            expect(div4).not.toHaveFocus();
        });

        test('should move to next element on key up', () => {
            expect(handleKeyboardNav({ key: 'ArrowUp', target: div3 })).toBe(true);
            expect(div2).toHaveFocus();
            expect(div4).not.toHaveFocus();
        });

        test('should move to next element on key left', () => {
            expect(handleKeyboardNav({ key: 'ArrowLeft', target: div3 })).toBe(true);
            expect(div2).toHaveFocus();
            expect(div4).not.toHaveFocus();
        });
    });
});
