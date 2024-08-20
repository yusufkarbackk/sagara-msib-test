export const createBajuValidationSchema = {
    warna: {
        notEmpty: {
            errorMessage: "warna tidak boleh kosong"
        },
        isString: {
            errorMessage: "Warna harus bertipe data string"
        }
    },
    ukuran: {
        notEmpty: {
            errorMessage: "ukuran tidak boleh kosong"
        },
        isString: {
            errorMessage: "ukuran harus bertipe data string"
        }
    },
    harga: {
        notEmpty: {
            errorMessage: "harga tidak boleh kosong"
        },
        isInt: {
            errorMessage: "harga harus bertipe data angka"
        }
    },
    stok: {
        notEmpty: {
            errorMessage: "stok tidak boleh kosong"
        },
        isInt: {
            errorMessage: "stok harus bertipe data string"
        }
    }
}

export const updateBajuVaidationSchema = {
    warna: {
        optional: true,
        isString: true,
        errorMessage: 'Warna must be a string'
    },
    ukuran: {
        optional: true,
        isString: true,
        errorMessage: 'Ukuran must be a string'
    },
    harga: {
        optional: true,
        isInt: true,
        toInt: true,
        errorMessage: 'Harga must be an integer'
    },
    stok: {
        optional: true,
        isInt: true,
        toInt: true,
        errorMessage: 'Stok must be an integer'
    }
}