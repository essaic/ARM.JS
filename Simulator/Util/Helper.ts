﻿module ARM.Simulator {
    /**
     * Provides various utility and helper methods.
     */
    export class Util {
        /**
         * Performs sign extension on the specified integer when it is transformed into a
         * larger datatype.
         *
         * @param {number} v
         *  The value to sign-extend.
         * @param {number} f
         *  The size of v, in bits.
         * @param {number} t
         *  The size v should be extended to, in bits.
         * @return {number}
         *  The sign-extended value.
         */
        static SignExtend(v: number, f: number, t: number): number {
            var msb = f - 1;
            if (v & (1 << msb)) {
                for (var i = 1 + msb; i < t; i++)
                    v |= (1 << i);
            }
            return v;
        }

        /**
         * Performs a bitwise right-rotation on the specified value by the specified number
         * of bits.
         *
         * @param {number} v
         *  The value to right-rotate.
         * @param {number} n
         *  The number of bits to rotate.
         * @return {number}
         *  The original value right-rotated by the specified number of bits.
         */
        static RotateRight(v: number, n: number): number {
            for (var i = 0; i < n; i++)
                v = (v >>> 1) | ((v & 0x01) << 31);
            return v;
        }

        /**
         * Returns the number of set bits in the specified 32-bit value.
         *
         * @param {number} v
         *  The value to get the number of set bits for.
         * @return
         *  The number of bits set for the value specified.
         */
        static CountBits(v: number): number {
            var c = 0;
            for (var i = 0; i < 32; i++) {
                if (v & (1 << i))
                    c++;
            }
            return c;
        }

        /**
         * Removes the specified element from the specified array.
         * 
         * @param array
         *  The array to remove the element from.
         * @param element
         *  The element to remove.
         * @return
         *  true if the specified element has been removed from the array; false if the element
         *  could not be found.
         */
        static ArrayRemove(array: any[], element: any) {
            var index = array.indexOf(element);
            if (index < 0)
                return false;
            array.splice(index, 1);
            return true;
        }

        /**
         * Inserts the specified element into the specified array using the specified
         * comparison function.
         * 
         * @param _array
         *  The array to insert the element into.
         * @param _element
         *  The element to insert into the array.
         * @param _comparer
         *  The comparison function to use for determining the position at which the element
         *  will be inserted into the array.
         * @return
         *  The index at which the element has been inserted.
         */
        static ArrayInsert(_array: any[], _element: any, _comparer: (a: any, b: any) => number) {
            function locationOf(element, array, comparer, start?: number, end?: number) {
                if (array.length === 0)
                    return -1;
                start = start || 0;
                end = end || array.length;
                var pivot = (start + end) >> 1,
                    c = comparer(element, array[pivot]);
                if (end - start <= 1)
                    return c == -1 ? pivot - 1 : pivot;
                switch (c) {
                    case -1:
                        return locationOf(element, array, comparer, start, pivot);
                    case 0:
                        return pivot;
                    case 1:
                        return locationOf(element, array, comparer, pivot, end);
                };
                // ReSharper disable once NotAllPathsReturnValue
            };
            var index = locationOf(_element, _array, _comparer) + 1;
            _array.splice(index, 0, _element);
            return index;
        }
    }
}

/**
 * Extends the Number type.
 */
interface Number {
    /**
     * Returns an unsigned 32-bit number.
     */
    toUint32(): number;

    /**
     * Returns a signed 32-bit number.
     */
    toInt32(): number;

    /**
     * Returns the number instance as a hex string, optionally padded by the specified amount,
     * prefixed by '0x'.
     *
     * @param {number} pad
     *  The amount of padding.
     */
    toHex(pad?: number): string;

    /**
     * Determines whether the most-significant bit is set.
     */
    msb(): boolean;
}

/**
 * Returns an unsigned 32-bit number.
 *
 * Javascript stores all numbers as double values. Using bitwise operations is achieved by
 * internally converting back and forth between double and integer representations. Also all
 * bitwise operations but >>> will return signed numbers.
 *
 * var A = 0x80000000       (Positive value)
 * var B = A & 0xFFFFFFFF   (Negative value, not what we want)
 *
 * @return {number}
 *  Returns an unsigned 32-bit number.
 */
Number.prototype.toUint32 = function () {
    return this >>> 0;
}

/**
 * Returns a signed 32-bit number.
 *
 * @return {number}
 *  Returns a signed 32-bit number.
 */
Number.prototype.toInt32 = function () {
    return this | 0;
}

/**
 * Returns the number instance as a hex string, optionally padded by the specified amount,
 * prefixed by '0x'.
 *
 * @param {number} pad
 *  The amount of padding.
 */
Number.prototype.toHex = function (pad?: number) {
    var p = pad || 8;
    return `0x${(Array(p + 1).join('0') + this.toString(16)).substr(-p)}`;
}

/**
 * Determines whether the most-significant bit is set.
 *
 * @return {boolean}
 *  True if the most-significant bit is set; Otherwise false.
 */
Number.prototype.msb = function () {
    return (this >>> 31) == 1;
}

/**
 * Extends the static Math class.
 */
interface Math {
    /**
     * Adds two 64-bit integers.
     *
     * @param a
     *  The first 64-bit integer, composed of an object consisting of two 32-bit integer
     *  values, lo and hi, making up the lower and upper 32-bits of the 64-bit value.
     * @param b
     *  The second 64-bit integer, composed of an object consisting of two 32-bit integer
     *  values, lo and hi, making up the lower and upper 32-bits of the 64-bit value.
     * @return
     *  The sum of the two specified 64-bit integers.
     */
    add64(a: { hi: number, lo: number }, b: { hi: number, lo: number }):
        { hi: number, lo: number };

    /**
     * Multiplies two unsigned 32-bit values.
     *
     * @param {number} a
     *  The unsigned 32-bit multiplicand.
     * @param {number} b
     *  The unsigned 32-bit multiplier.
     * @return
     *  The product of the two unsigned 32-bit values as an unsigned 64-bit value, made up of
     *  an object consisting of two 32-bit integer values, lo and hi, making up the lower
     *  and upper 32-bit halves of the 64-bit value.
     */
    umul64(a: number, b: number): { hi: number, lo: number };

    /**
     * Multiplies two signed 32-bit values.
     *
     * @param {number} a
     *  The 32-bit multiplicand.
     * @param {number} b
     *  The 32-bit multiplier.
     * @return
     *  The product of the two signed 32-bit values as 64-bit value, made up of an object
     *  consisting of two 32-bit integer values, lo and hi, making up the lower and upper
     *  32-bit halves of the 64-bit value.
     */
    smul64(a: number, b: number): { hi: number, lo: number };
}

/**
 * Adds two 64-bit integers.
 *
 * @param a
 *  The first 64-bit integer, composed of an object consisting of two 32-bit integer
 *  values, lo and hi, making up the lower and upper 32-bits of the 64-bit value.
 * @param b
 *  The second 64-bit integer, composed of an object consisting of two 32-bit integer
 *  values, lo and hi, making up the lower and upper 32-bits of the 64-bit value.
 * @return
 *  The sum of the two specified 64-bit integers.
 */
Math.add64 = (a, b) => {
    var rh = a.hi + b.hi, rl = a.lo + b.lo;
    if (rl > 0xffffffff)
        rh = rh + 1;
    return { hi: rh.toUint32(), lo: rl.toUint32() };
}

/**
 * Multiplies two unsigned 32-bit values.
 *
 * @param {number} a
 *  The unsigned 32-bit multiplicand.
 * @param {number} b
 *  The unsigned 32-bit multiplier.
 * @return
 *  The product of the two unsigned 32-bit values as an unsigned 64-bit value, made up of
 *  an object consisting of two 32-bit integer values, lo and hi, making up the lower
 *  and upper 32-bit halves of the 64-bit value.
 */
Math.umul64 = (a, b) => {
    var ah = (a >>> 16), al = a & 0xffff,
        bh = (b >>> 16), bl = b & 0xffff,
        rh = (ah * bh), rl = (al * bl),
        rm1 = ah * bl, rm2 = al * bh,
        rm1h = rm1 >>> 16, rm2h = rm2 >>> 16,
        rm1l = rm1 & 0xffff, rm2l = rm2 & 0xffff,
        rmh = rm1h + rm2h, rml = rm1l + rm2l;
    if (rl > (rl + (rml << 16)).toUint32())
        rmh = rmh + 1;
    rl = (rl + (rml << 16)).toUint32();
    rh = rh + rmh;
    if (rml & 0xffff0000)
        rh = rh + 1;
    return { hi: rh, lo: rl };
}

/**
 * Multiplies two signed 32-bit values.
 *
 * @param {number} a
 *  The 32-bit multiplicand.
 * @param {number} b
 *  The 32-bit multiplier.
 * @return
 *  The product of the two signed 32-bit values as 64-bit value, made up of an object
 *  consisting of two 32-bit integer values, lo and hi, making up the lower and upper
 *  32-bit halves of the 64-bit value.
 */
Math.smul64 = (a, b) => {
    var neg = ((a & 0x80000000) ^ (b & 0x80000000)) ? 1 : 0,
        _a = (a & 0x80000000) ? (1 + (~a)).toUint32() : a.toUint32(),
        _b = (b & 0x80000000) ? (1 + (~b)).toUint32() : b.toUint32(),
        _c = Math.umul64(_a, _b);
    if (neg) {
        var carry = 0;
        _c.lo = (~_c.lo).toUint32();
        if (_c.lo > (_c.lo + 1).toUint32())
            carry = 1;
        _c.lo = (_c.lo + 1).toUint32();
        _c.hi = ((~_c.hi).toUint32() + carry).toUint32();
    }
    return { hi: _c.hi, lo: _c.lo };
}