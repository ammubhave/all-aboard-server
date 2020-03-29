export function rotateArrayRandom<T>(array: T[]) {
    const count = Math.floor(Math.random() * array.length);
    for (let i = 0; i < count; i++) {
        array.push(array.shift());
    }
    return array;
}

export function shuffleArrayRandom<T>(array: T[]) {
    let currentIndex = array.length;

    while (0 !== currentIndex) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        const temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}