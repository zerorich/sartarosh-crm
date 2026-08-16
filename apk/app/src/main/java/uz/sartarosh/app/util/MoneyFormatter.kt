package uz.sartarosh.app.util

import kotlin.math.roundToLong

object MoneyFormatter {

    fun formatUzs(amount: Double): String {
        val value = amount.roundToLong()
        return formatGrouped(value) + " UZS"
    }

    fun formatGrouped(value: Long): String {
        val raw = value.toString()
        return raw.reversed().chunked(3).joinToString(" ").reversed()
    }
}
