package uz.sartarosh.app.ui.salons.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import uz.sartarosh.app.R
import uz.sartarosh.app.data.model.SalonDto
import uz.sartarosh.app.databinding.ItemSalonBinding
import java.util.Locale
import kotlin.math.abs

class SalonListAdapter(
    private val onSalonClick: (SalonDto) -> Unit,
) : ListAdapter<SalonDto, SalonListAdapter.SalonViewHolder>(DiffCallback) {

    companion object {
        private val COVERS = intArrayOf(
            R.drawable.img_salon_cover_1,
            R.drawable.img_salon_cover_2,
            R.drawable.img_salon_cover_3,
            R.drawable.img_salon_cover_4,
        )

        fun coverFor(id: String): Int = COVERS[abs(id.hashCode()) % COVERS.size]
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SalonViewHolder {
        val binding = ItemSalonBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false,
        )
        return SalonViewHolder(binding)
    }

    override fun onBindViewHolder(holder: SalonViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class SalonViewHolder(
        private val binding: ItemSalonBinding,
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(salon: SalonDto) {
            binding.salonCover.setImageResource(coverFor(salon.id))
            binding.salonName.text = salon.name
            binding.salonAddress.text = buildString {
                append(salon.address)
                salon.city?.let { append(", ").append(it) }
            }
            binding.salonRating.text = String.format(
                Locale.getDefault(),
                "%.1f (%d)",
                salon.rating,
                salon.reviewCount,
            )
            binding.root.setOnClickListener { onSalonClick(salon) }
        }
    }

    private object DiffCallback : DiffUtil.ItemCallback<SalonDto>() {
        override fun areItemsTheSame(oldItem: SalonDto, newItem: SalonDto): Boolean =
            oldItem.id == newItem.id

        override fun areContentsTheSame(oldItem: SalonDto, newItem: SalonDto): Boolean =
            oldItem == newItem
    }
}
