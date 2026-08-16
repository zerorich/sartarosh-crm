package uz.sartarosh.app.ui.bookings

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import uz.sartarosh.app.data.model.BookingDto
import uz.sartarosh.app.data.model.BookingStatus
import uz.sartarosh.app.databinding.ItemBookingBinding
import uz.sartarosh.app.util.MoneyFormatter
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

class BookingListAdapter(
    private val onCancelClick: (BookingDto) -> Unit,
    private val onLongPress: (BookingDto) -> Unit,
    private val canCancel: (BookingStatus) -> Boolean,
) : ListAdapter<BookingDto, BookingListAdapter.ViewHolder>(DiffCallback) {

    private val dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm", Locale.getDefault())

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemBookingBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolder(
        private val binding: ItemBookingBinding,
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(booking: BookingDto) {
            binding.salonName.text = booking.salon?.name ?: booking.salonId
            binding.serviceName.text = booking.service?.name ?: booking.serviceId
            binding.statusChip.text = booking.status.name
            binding.dateTime.text = formatDateTime(booking.startAt)
            binding.price.text = MoneyFormatter.formatUzs(booking.price)

            val cancellable = canCancel(booking.status)
            binding.cancelButton.isVisible = cancellable

            binding.cancelButton.setOnClickListener { onCancelClick(booking) }
            binding.root.setOnLongClickListener {
                if (cancellable) {
                    onLongPress(booking)
                    true
                } else {
                    false
                }
            }
        }

        private fun formatDateTime(iso: String): String {
            return runCatching {
                Instant.parse(iso).atZone(ZoneId.systemDefault()).format(dateFormatter)
            }.getOrDefault(iso)
        }
    }

    private object DiffCallback : DiffUtil.ItemCallback<BookingDto>() {
        override fun areItemsTheSame(oldItem: BookingDto, newItem: BookingDto) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: BookingDto, newItem: BookingDto) = oldItem == newItem
    }
}
