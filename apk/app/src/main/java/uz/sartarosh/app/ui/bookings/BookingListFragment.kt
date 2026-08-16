package uz.sartarosh.app.ui.bookings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import kotlinx.coroutines.launch
import uz.sartarosh.app.R
import uz.sartarosh.app.data.model.BookingDto
import uz.sartarosh.app.data.repository.AuthRepository
import uz.sartarosh.app.data.repository.BookingRepository
import uz.sartarosh.app.databinding.FragmentBookingListBinding

class BookingListFragment : Fragment() {

    private var _binding: FragmentBookingListBinding? = null
    private val binding get() = _binding!!

    private val repository = BookingRepository()
    private lateinit var adapter: BookingListAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentBookingListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = BookingListAdapter(
            onCancelClick = ::confirmCancel,
            onLongPress = ::confirmCancel,
            canCancel = repository::canCancel,
        )

        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter
        binding.swipeRefresh.setOnRefreshListener { loadBookings(showFullScreenLoader = false) }

        loadBookings(showFullScreenLoader = true)
    }

    override fun onResume() {
        super.onResume()
        if (_binding != null && !binding.swipeRefresh.isRefreshing && adapter.itemCount == 0) {
            loadBookings(showFullScreenLoader = false)
        }
    }

    private fun loadBookings(showFullScreenLoader: Boolean) {
        viewLifecycleOwner.lifecycleScope.launch {
            if (showFullScreenLoader) {
                binding.progressBar.isVisible = true
                binding.errorView.isVisible = false
            }

            repository.listBookings()
                .onSuccess { bookings ->
                    binding.progressBar.isVisible = false
                    binding.swipeRefresh.isRefreshing = false
                    binding.errorView.isVisible = false
                    adapter.submitList(bookings)
                    binding.emptyView.isVisible = bookings.isEmpty()
                    binding.recyclerView.isVisible = bookings.isNotEmpty()
                }
                .onFailure { error ->
                    binding.progressBar.isVisible = false
                    binding.swipeRefresh.isRefreshing = false
                    binding.errorView.isVisible = true
                    binding.errorView.text = error.message ?: getString(R.string.bookings_load_error)
                }
        }
    }

    private fun confirmCancel(booking: BookingDto) {
        val input = EditText(requireContext()).apply {
            hint = getString(R.string.cancel_reason_hint)
        }

        AlertDialog.Builder(requireContext())
            .setTitle(R.string.cancel_booking_title)
            .setMessage(getString(R.string.cancel_booking_message, booking.salon?.name ?: ""))
            .setView(input)
            .setPositiveButton(R.string.cancel_booking) { _, _ ->
                performCancel(booking.id, input.text?.toString()?.trim()?.takeIf { it.isNotEmpty() })
            }
            .setNegativeButton(android.R.string.cancel, null)
            .show()
    }

    private fun performCancel(bookingId: String, reason: String?) {
        viewLifecycleOwner.lifecycleScope.launch {
            binding.progressBar.isVisible = true
            repository.cancelBooking(bookingId, reason)
                .onSuccess {
                    binding.progressBar.isVisible = false
                    Toast.makeText(requireContext(), R.string.booking_cancelled, Toast.LENGTH_SHORT).show()
                    loadBookings(showFullScreenLoader = false)
                }
                .onFailure { error ->
                    binding.progressBar.isVisible = false
                    val message = when (error) {
                        is AuthRepository.ApiException -> error.message
                        else -> error.message
                    }
                    Toast.makeText(requireContext(), message ?: getString(R.string.booking_error), Toast.LENGTH_LONG).show()
                }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
