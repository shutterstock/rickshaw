#!/usr/bin/env perl

use warnings;
use strict;

my @header;
my $data;

while (<>) {

	# the third line is the header
	if ($. == 3) {
		          # and we want the years
		@header = map { m/^(\d{4})/; $1; }
	              (split ',')[1..11];
	}

	if (m/^United States/) {
		my $i = -1;
		$data = "[ " . join(", ", map { "{ x: $header[++$i], y: $_ }" } (split ',')[1..11]) . " ]";
		last;
	}
}

print $data;
